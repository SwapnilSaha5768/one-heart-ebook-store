from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView, 
    MeView, 
    AddressListCreateView, 
    AddressDetailView,
    ThrottledTokenObtainPairView
)

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


]
