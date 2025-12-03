#backed/accounts/urls.py

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

from .views import RegisterView, MeView, AddressListCreateView, AddressDetailView,ThrottledTokenObtainPairView,VerifyEmailOTPView, ResendEmailOTPView, ForgotPasswordRequestView, ResetPasswordView, AdminUserListView

urlpatterns = [
    # Register
    path('register/', RegisterView.as_view(), name='auth_register'),

    # JWT Login / Refresh
    path('login/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Current user + profile
    path('me/', MeView.as_view(), name='auth_me'),

    path('addresses/', AddressListCreateView.as_view(), name='address_list_create'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address_detail'),
    path('verify-email/', VerifyEmailOTPView.as_view(), name='verify_email'),
    path('resend-otp/', ResendEmailOTPView.as_view(), name='resend_otp'),
    path('forgot-password/', ForgotPasswordRequestView.as_view(), name='forgot_password'),
    path('forgot-password/', ForgotPasswordRequestView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('users/', AdminUserListView.as_view(), name='admin_user_list'),
]
