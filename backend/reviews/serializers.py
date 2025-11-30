# backend/reviews/serializers.py
from django.conf import settings
from rest_framework import serializers

from .models import Review
from accounts.serializers import UserSerializer

User = settings.AUTH_USER_MODEL


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'user',
            'book',
            'rating',
            'title',
            'body',
            'is_approved',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'is_approved', 'created_at', 'updated_at']
