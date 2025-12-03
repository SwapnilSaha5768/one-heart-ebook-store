# backend/catalog/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AuthorViewSet, CategoryViewSet, TagViewSet, BookViewSet, AdminBookViewSet

router = DefaultRouter()

router.register("books", BookViewSet, basename="books")
router.register("authors", AuthorViewSet, basename="authors")
router.register("categories", CategoryViewSet, basename="categories")
router.register("tags", TagViewSet, basename="tags")
router.register("admin/books", AdminBookViewSet, basename="admin-books")

urlpatterns = [
    path("", include(router.urls)),
]
