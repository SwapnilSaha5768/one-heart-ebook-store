# backend/catalog/serializers.py
from rest_framework import serializers

from .models import Author, Category, Tag, Book


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'bio', 'website']


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class BookListSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    effective_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    average_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'slug',
            'cover_image',
            'price',
            'discount_price',
            'effective_price',
            'currency',
            'authors',
            'categories',
            'is_published',
            'average_rating',
            'reviews_count',
            'description',
        ]


class BookDetailSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    effective_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    average_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'authors',
            'categories',
            'tags',
            'cover_image',
            'file_format',
            'price',
            'discount_price',
            'effective_price',
            'currency',
            'isbn',
            'language',
            'pages',
            'publication_date',
            'is_published',
            'created_at',
            'updated_at',
            'average_rating',
            'reviews_count',
        ]
