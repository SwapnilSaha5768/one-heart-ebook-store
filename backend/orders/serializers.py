# backend/orders/serializers.py

from django.conf import settings
from rest_framework import serializers

from .models import Cart, CartItem, Order, OrderItem
from catalog.serializers import BookListSerializer
from catalog.models import Book
from accounts.serializers import AddressSerializer
from accounts.models import Address
from payments.serializers import PaymentSerializer

User = settings.AUTH_USER_MODEL


class CartItemSerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.filter(is_published=True),
        source='book',
        write_only=True,
    )
    subtotal = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = CartItem
        fields = ['id', 'book', 'book_id', 'quantity', 'unit_price', 'subtotal']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'session_id', 'items', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


# For safety we also keep a simpler "add to cart" serializer
class CartItemAddSerializer(serializers.Serializer):
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.filter(is_published=True),
        source='book',
    )
    quantity = serializers.IntegerField(min_value=1, default=1)


class OrderItemSerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'book', 'quantity', 'unit_price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    billing_address = AddressSerializer(read_only=True)
    billing_address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all(),
        source='billing_address',
        write_only=True,
        required=False,
        allow_null=True,
    )
    payment = PaymentSerializer(read_only=True)
    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'status',
            'user',
            'total_amount',
            'currency',
            'payment_method',
            'billing_address',
            'billing_address_id',
            'paid_at',
            'items',
            'payment',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'order_number',
            'status',
            'user',
            'paid_at',
            'created_at',
            'updated_at',
        ]
