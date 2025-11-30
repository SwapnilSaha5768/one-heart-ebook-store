from django.contrib import admin

from .models import Coupon, CouponRedemption


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "discount_type",
        "amount",
        "is_active",
        "valid_from",
        "valid_to",
        "uses_count",
        "max_uses",
    )
    search_fields = ("code",)
    list_filter = ("discount_type", "is_active", "valid_from", "valid_to")


@admin.register(CouponRedemption)
class CouponRedemptionAdmin(admin.ModelAdmin):
    list_display = ("coupon", "user", "order", "redeemed_at")
    search_fields = (
        "coupon__code",
        "user__username",
        "order__order_number",
    )
    list_filter = ("redeemed_at",)
