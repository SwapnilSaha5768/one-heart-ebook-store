# backend/blog/views.py
from rest_framework import viewsets, permissions
from rest_framework.response import Response

from .models import Post
from .serializers import PostListSerializer, PostDetailSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Read-only for everyone.
    Write (POST/PUT/PATCH/DELETE) only for admin/staff users.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class PostViewSet(viewsets.ModelViewSet):
    """
    /api/blog/posts/         -> list (only published)
    /api/blog/posts/<id>/    -> retrieve
    /api/blog/posts/ (POST)  -> create (admin only)
    """
    queryset = Post.objects.all()
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Post.objects.filter(is_published=True)
        # Optionally let admins see drafts:
        if self.request.user.is_staff:
            qs = Post.objects.all()
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return PostListSerializer
        return PostDetailSerializer

    def perform_create(self, serializer):
        # set author automatically
        serializer.save(author=self.request.user)
