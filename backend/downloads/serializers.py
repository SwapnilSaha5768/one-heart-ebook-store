# downloads/serializers.py
from rest_framework import serializers
from .models import PurchaseItem
from catalog.serializers import BookListSerializer


class PurchaseItemSerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)
    order_status = serializers.CharField(
        source='order_item.order.status',
        read_only=True
    )
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseItem
        fields = [
            'id',
            'book',
            'download_limit',
            'downloads_count',
            'is_active',
            'order_status',
            'payment_status',
        ]

    def get_payment_status(self, obj):
        order = obj.order_item.order if obj.order_item else None
        payment = getattr(order, 'payment', None) if order else None
        return payment.status if payment else None
