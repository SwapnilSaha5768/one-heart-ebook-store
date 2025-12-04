from django.urls import path
from .debug_views import debug_settings

urlpatterns = [
    path("", debug_settings),
]
