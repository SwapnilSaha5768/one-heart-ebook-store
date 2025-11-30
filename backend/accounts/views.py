from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.mail import send_mail
from django.conf import settings

from core.throttles import LoginThrottle
from rest_framework.permissions import IsAuthenticated

from .models import Profile, Address
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ProfileSerializer,
    AddressSerializer,
    MeSerializer,
)

User = get_user_model()


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
            Address.objects.filter(
                user=self.request.user
            ).exclude(pk=address.pk).update(is_default=False)



