# backend/accounts/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.core.mail import send_mail
from django.conf import settings
from .models import Profile, Address, EmailOTP, PasswordResetCode
from django.db.models import Q

User = get_user_model()



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # You can add/remove fields as needed
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user', 'phone', 'avatar', 'preferred_language', 'is_verified']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id',
            'full_name',
            'line1',
            'line2',
            'city',
            'postal_code',
            'country',
            'is_default',
        ]


# Optional: simple registration serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.is_active = False                  # 👈 cannot login yet
        user.is_email_verified = False
        user.save()

        # Ensure profile exists
        Profile.objects.get_or_create(user=user)

        # Create OTP
        code = EmailOTP.generate_code()
        EmailOTP.objects.create(user=user, code=code)

        # Email sending moved to view to handle errors gracefully

        return user

class EmailOTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        email = attrs.get("email")
        code = attrs.get("code")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or code.")

        attrs["user"] = user
        attrs["code"] = code
        return attrs

class ResendEmailOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get("email")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "No user found with this email."})

        if user.is_email_verified:
            raise serializers.ValidationError({"detail": "This email is already verified."})

        attrs["user"] = user
        return attrs

class ForgotPasswordRequestSerializer(serializers.Serializer):
    """
    User can enter username OR email.
    """
    identifier = serializers.CharField()

    def validate(self, attrs):
        identifier = attrs.get("identifier", "").strip()

        try:
            user = User.objects.get(
                Q(email__iexact=identifier) | Q(username__iexact=identifier)
            )
        except User.DoesNotExist:
            # you can return generic message to avoid user enumeration
            raise serializers.ValidationError(
                {"detail": "No account found with this username/email."}
            )

        if not user.is_email_verified:
            raise serializers.ValidationError(
                {"detail": "Email is not verified. Please verify your email first."}
            )

        attrs["user"] = user
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        email = attrs.get("email")
        code = attrs.get("code")
        new_password = attrs.get("new_password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "Invalid email or code."})

        attrs["user"] = user
        attrs["code"] = code
        attrs["new_password"] = new_password
        return attrs


class MeSerializer(serializers.Serializer):
    user = UserSerializer(read_only=True)
    profile = ProfileSerializer(read_only=True)
    addresses = AddressSerializer(many=True, read_only=True)

    class Meta:
        fields = ["user", "profile", "addresses"]

