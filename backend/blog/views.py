# backend/blog/views.py
from rest_framework import viewsets, permissions
from rest_framework.response import Response

from .models import Post
from .serializers import PostListSerializer, PostDetailSerializer, AdminPostSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Read-only for everyone.
    Write (POST/PUT/PATCH/DELETE) only for admin/staff users.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class PostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API: /api/blog/posts/
    - List: Only published posts
    - Retrieve: Only published posts
    """
    queryset = Post.objects.filter(is_published=True)
    serializer_class = PostListSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PostDetailSerializer
        return PostListSerializer


class AdminPostViewSet(viewsets.ModelViewSet):
    """
    Admin API: /api/admin/blog/posts/
    - Full CRUD for admins
    """
    queryset = Post.objects.all()
    serializer_class = AdminPostSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
