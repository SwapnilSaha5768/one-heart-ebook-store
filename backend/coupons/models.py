from django.db import models
from django.conf import settings
from django.utils import timezone

from core.models import TimeStampedModel
from orders.models import Order


User = settings.AUTH_USER_MODEL


class Coupon(TimeStampedModel):
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'percentage'
        FIXED = 'fixed'

    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    max_uses = models.PositiveIntegerField(null=True, blank=True)
    uses_count = models.PositiveIntegerField(default=0)

    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    def is_valid_now(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if self.valid_from > now:
            return False
        if self.valid_to and self.valid_to < now:
            return False
        if self.max_uses and self.uses_count >= self.max_uses:
            return False
        return True

    def __str__(self):
        return self.code


class CouponRedemption(TimeStampedModel):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order = models.OneToOneField(Order, on_delete=models.CASCADE)

    redeemed_at = models.DateTimeField(auto_now_add=True)
