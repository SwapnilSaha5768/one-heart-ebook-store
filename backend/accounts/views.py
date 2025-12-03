# backend/accounts/views.py

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import timedelta
from django.utils import timezone
from core.throttles import LoginThrottle
from rest_framework.permissions import IsAuthenticated

from .models import Profile, Address, EmailOTP, PasswordResetCode
from django.conf import settings

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ProfileSerializer,
    AddressSerializer,
    MeSerializer,
    EmailOTPVerifySerializer,
    ResendEmailOTPSerializer,
    ForgotPasswordRequestSerializer,
    ResetPasswordSerializer,
)

# Email helpers (create backend/accounts/emails.py if not present)
from .emails import send_otp_email, send_password_reset_email

User = get_user_model()


def _get_client_ip(request):
    """
    Try to retrieve client's IP address from common headers.
    """
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        # X-Forwarded-For may contain many IPs, take the first
        ip = xff.split(",")[0].strip()
        if ip:
            return ip
    return request.META.get("REMOTE_ADDR") or "unknown"


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginThrottle]


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Body: { "username": "", "email": "", "password": "" }
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Retrieve the OTP created by the serializer
        otp = EmailOTP.objects.filter(user=user, is_used=False).order_by('-created_at').first()
        code = otp.code if otp else "????"

        message_detail = "We sent a verification code to your email. Please verify to activate your account."

        try:
            # send using helper which uses templates
            send_otp_email(
                user,
                code,
                expiry_minutes=10,
                ip_address=_get_client_ip(request),
                fail_silently=False,
            )
        except Exception as e:
            # Keep behaviour: don't fail registration if email sending fails
            print(f"Error sending email: {e}")
            message_detail = "Account created, but we failed to send the verification email. Please try 'Resend OTP' later."

        return Response(
            {
                "detail": message_detail,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailOTPView(APIView):
    """
    POST /api/auth/verify-email/
    Body: { "email": "", "code": "" }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = EmailOTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        code = serializer.validated_data["code"]

        otp_obj = (
            EmailOTP.objects.filter(user=user, code=code, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if not otp_obj:
            return Response(
                {"detail": "Invalid verification code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # expiry 10 minutes
        if otp_obj.created_at < timezone.now() - timedelta(minutes=10):
            return Response(
                {"detail": "Verification code has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark OTP & user as verified
        otp_obj.is_used = True
        otp_obj.save()

        user.is_active = True
        user.is_email_verified = True
        user.save()

        # also update Profile.is_verified if exists
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.is_verified = True
        profile.save()

        return Response(
            {"detail": "Email verified successfully. You can now log in."},
            status=status.HTTP_200_OK,
        )


class ResendEmailOTPView(APIView):
    """
    POST /api/auth/resend-otp/
    Body: { "email": "" }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ResendEmailOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        # Optional rate limit: don't resend if last OTP < 60 seconds ago
        last_otp = (
            EmailOTP.objects.filter(user=user)
            .order_by("-created_at")
            .first()
        )
        if last_otp and (timezone.now() - last_otp.created_at).total_seconds() < 60:
            return Response(
                {"detail": "Please wait a bit before requesting a new code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark previous unused OTPs as used
        EmailOTP.objects.filter(user=user, is_used=False).update(is_used=True)

        # Create new OTP
        code = EmailOTP.generate_code()
        EmailOTP.objects.create(user=user, code=code)

        # Send email via helper
        try:
            send_otp_email(
                user,
                code,
                expiry_minutes=10,
                ip_address=_get_client_ip(request),
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending resend OTP email: {e}")
            return Response(
                {"detail": "Failed to send new verification code. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"detail": "A new verification code has been sent to your email."},
            status=status.HTTP_200_OK,
        )


class ForgotPasswordRequestView(APIView):
    """
    POST /api/auth/forgot-password/
    Body: { "identifier": "<username or email>" }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ForgotPasswordRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        # Rate limit: if last reset < 60 seconds ago, block
        last_code = (
            PasswordResetCode.objects.filter(user=user)
            .order_by("-created_at")
            .first()
        )
        if last_code and (timezone.now() - last_code.created_at).total_seconds() < 60:
            return Response(
                {"detail": "Please wait a bit before requesting a new reset code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark previous unused reset codes as used
        PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)

        # Create new reset code
        code = PasswordResetCode.generate_code()
        PasswordResetCode.objects.create(user=user, code=code)

        # Send email via helper
        try:
            send_password_reset_email(
                user,
                code=code,
                expiry_minutes=10,
                ip_address=_get_client_ip(request),
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending password reset email: {e}")
            # do not reveal too much to client
            return Response(
                {"detail": "Failed to send reset email. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "detail": "If an account exists, a password reset code has been sent to the associated email.",
                "email": user.email,
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Body: { "email": "", "code": "", "new_password": "" }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        code = serializer.validated_data["code"]
        new_password = serializer.validated_data["new_password"]

        reset_obj = (
            PasswordResetCode.objects.filter(
                user=user,
                code=code,
                is_used=False,
            )
            .order_by("-created_at")
            .first()
        )

        if not reset_obj:
            return Response(
                {"detail": "Invalid reset code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # expiry 10 minutes
        if reset_obj.created_at < timezone.now() - timedelta(minutes=10):
            return Response(
                {"detail": "Reset code has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark used
        reset_obj.is_used = True
        reset_obj.save()

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response(
            {"detail": "Password has been reset successfully. You can now log in."},
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        GET /api/auth/me/
        Returns logged-in user's data + profile + addresses.
        """
        user = request.user

        # Ensure profile always exists
        profile, _ = Profile.objects.get_or_create(user=user)

        # All addresses of this user (default ones first if you have these fields)
        addresses = Address.objects.filter(user=user).order_by(
            "-is_default", "-created_at"
        )

        serializer = MeSerializer(
            {
                "user": user,
                "profile": profile,
                "addresses": addresses,
            }
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        """
        PATCH /api/auth/me/
        Partially update user + profile.
        Expected fields (example):
        {
            "first_name": "...",
            "last_name": "...",
            "phone": "...",
            "preferred_language": "..."
        }
        """
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)

        # Use serializers for validation instead of manual assignment
        user_serializer = UserSerializer(user, data=request.data, partial=True)
        profile_serializer = ProfileSerializer(profile, data=request.data, partial=True)

        if not user_serializer.is_valid() or not profile_serializer.is_valid():
            return Response(
                {
                    "user_errors": user_serializer.errors,
                    "profile_errors": profile_serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_serializer.save()
        profile_serializer.save()

        addresses = Address.objects.filter(user=user).order_by(
            "-is_default", "-created_at"
        )

        me_serializer = MeSerializer(
            {
                "user": user,
                "profile": profile,
                "addresses": addresses,
            }
        )
        return Response(me_serializer.data, status=status.HTTP_200_OK)


class AddressListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/auth/addresses/       -> list current user's addresses
    POST /api/auth/addresses/       -> create a new address for current user
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only addresses of the logged-in user
        return Address.objects.filter(user=self.request.user).order_by(
            "-is_default", "-created_at"
        )

    def perform_create(self, serializer):
        # Save with current user
        address = serializer.save(user=self.request.user)

        # If this one is default, unset others
        if address.is_default:
            Address.objects.filter(
                user=self.request.user
            ).exclude(pk=address.pk).update(is_default=False)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/auth/addresses/<id>/    -> retrieve one
    PUT    /api/auth/addresses/<id>/    -> full update
    PATCH  /api/auth/addresses/<id>/    -> partial update
    DELETE /api/auth/addresses/<id>/    -> delete
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # User can only touch their own addresses
        return Address.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        address = serializer.save()

        # If this one is now default, unset others
        if address.is_default:
            Address.objects.filter(user=self.request.user).exclude(pk=address.pk).update(is_default=False)


class AdminUserListView(generics.ListAPIView):
    """
    GET /api/auth/users/
    -> list ALL users (admin only)
    """
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

