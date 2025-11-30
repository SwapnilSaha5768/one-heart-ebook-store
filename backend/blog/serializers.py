# backend/blog/serializers.py
from rest_framework import serializers
from .models import Post


class PostListSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "featured_image",
            "created_at",
            "published_at",
            "author_name",
        ]

    def get_author_name(self, obj):
        if obj.author:
            full = f"{obj.author.first_name} {obj.author.last_name}".strip()
            return full or obj.author.username
        return None


class PostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "content",
            "featured_image",
            "created_at",
            "published_at",
            "author_name",
        ]

    def get_author_name(self, obj):
        if obj.author:
            full = f"{obj.author.first_name} {obj.author.last_name}".strip()
            return full or obj.author.username
        return None
