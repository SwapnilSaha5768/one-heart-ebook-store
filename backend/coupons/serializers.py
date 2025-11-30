# backend/coupons/serializers.py

from rest_framework import serializers

from .models import Coupon, CouponRedemption


class CouponSerializer(serializers.ModelSerializer):
    is_valid_now = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'description',
            'discount_type',
            'amount',
            'max_uses',
            'uses_count',
            'valid_from',
            'valid_to',
            'is_active',
            'is_valid_now',
        ]

    def get_is_valid_now(self, obj):
        return obj.is_valid_now()


class CouponRedemptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouponRedemption
        fields = [
            'id',
            'coupon',
            'user',
            'order',
            'redeemed_at',
        ]
        read_only_fields = ['redeemed_at']
