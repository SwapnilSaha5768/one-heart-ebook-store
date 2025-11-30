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
)


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [permissions.AllowAny]


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]


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
