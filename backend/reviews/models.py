from django.db import models
from django.conf import settings

from core.models import TimeStampedModel
from catalog.models import Book


User = settings.AUTH_USER_MODEL


class Review(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reviews')

    rating = models.PositiveSmallIntegerField()  # 1 to 5
    title = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)
    is_approved = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"{self.rating}★ by {self.user}"
