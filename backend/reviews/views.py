from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Review
from .serializers import ReviewSerializer
from .permissions import IsReviewOwnerOrReadOnly
from downloads.models import PurchaseItem
from catalog.models import Book


class ReviewViewSet(viewsets.ModelViewSet):
    """
    /api/reviews/            [GET, POST]
    /api/reviews/<id>/       [GET, PUT, PATCH, DELETE]

    Query params:
    - ?book=<book_id>  -> filter by book
    """
    serializer_class = ReviewSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsReviewOwnerOrReadOnly,
    ]

    def get_queryset(self):
        qs = Review.objects.select_related('user', 'book')
        book_id = self.request.query_params.get('book')
        if book_id:
            qs = qs.filter(book_id=book_id, is_approved=True)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        book = serializer.validated_data.get('book')

        if not user.is_authenticated:
            raise ValidationError("Authentication required to review.")

        # Check if user purchased this book
        has_bought = PurchaseItem.objects.filter(
            user=user,
            book=book,
            is_active=True,
        ).exists()

        if not has_bought:
            raise ValidationError("You can review only books you have purchased.")

        # Enforce one review per user per book (also backed by unique_together)
        if Review.objects.filter(user=user, book=book).exists():
            raise ValidationError("You have already reviewed this book.")

        serializer.save(user=user)
