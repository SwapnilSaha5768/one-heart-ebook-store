# backend/catalog/views.py
from .filters import BookFilter
from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Author, Category, Tag, Book
from .serializers import (
    AuthorSerializer,
    CategorySerializer,
    TagSerializer,
    BookListSerializer,
    BookDetailSerializer,
    AdminBookSerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAdminOrReadOnly]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]


class BookViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/books/
    GET /api/books/<slug>/

    Supports:
      - search: ?search=python
      - filter by category: ?category=programming
      - filter by tag: ?tag=django
      - filter by language: ?language=Bangla
      - file format: ?file_format=pdf
      - price range: ?min_price=100&max_price=500
      - ordering: ?ordering=price or -price
    """

    queryset = Book.objects.filter(is_published=True).prefetch_related(
        "authors", "categories", "tags"
    )
    permission_classes = [permissions.AllowAny]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BookFilter
    search_fields = ["title", "description", "authors__name", "tags__name"]
    ordering_fields = ["price", "discount_price", "created_at"]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return BookDetailSerializer
        return BookListSerializer


class AdminBookViewSet(viewsets.ModelViewSet):
    """
    CRUD for Books (Admin only)
    """
    queryset = Book.objects.all().order_by("-created_at")
    serializer_class = AdminBookSerializer
    permission_classes = [permissions.IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        from django.db.models import ProtectedError
        from rest_framework.response import Response
        from rest_framework import status

        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"error": "Cannot delete this book because it is part of an existing order. Please archive it instead."},
                status=status.HTTP_400_BAD_REQUEST
            )

