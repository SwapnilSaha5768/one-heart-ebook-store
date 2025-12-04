# backend/blog/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import PostViewSet, AdminPostViewSet

router = DefaultRouter()
router.register("blog/posts", PostViewSet, basename="blog-post")
router.register("admin/blog/posts", AdminPostViewSet, basename="admin-blog-post")

urlpatterns = [
    path("", include(router.urls)),
]
