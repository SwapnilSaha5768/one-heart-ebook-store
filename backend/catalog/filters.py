# backend/catalog/filters.py

import django_filters
from .models import Book


class BookFilter(django_filters.FilterSet):
    # price range: ?min_price=100&max_price=500
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')

    # discount price range (optional)
    min_discount_price = django_filters.NumberFilter(
        field_name='discount_price', lookup_expr='gte'
    )
    max_discount_price = django_filters.NumberFilter(
        field_name='discount_price', lookup_expr='lte'
    )

    # language exact match: ?language=en / ?language=Bangla
    language = django_filters.CharFilter(field_name='language', lookup_expr='iexact')

    # categories & tags by slug:
    category = django_filters.CharFilter(field_name='categories__slug', lookup_expr='iexact')
    tag = django_filters.CharFilter(field_name='tags__slug', lookup_expr='iexact')

    class Meta:
        model = Book
        fields = [
            'file_format',   # e.g. ?file_format=pdf
            'language',
            'category',
            'tag',
        ]
