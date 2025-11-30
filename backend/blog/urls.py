# backend/blog/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import PostViewSet

router = DefaultRouter()
router.register("blog/posts", PostViewSet, basename="blog-post")

urlpatterns = [
    path("", include(router.urls)),
]
