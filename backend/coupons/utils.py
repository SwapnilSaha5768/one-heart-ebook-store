# backend/coupons/utils.py

from decimal import Decimal, ROUND_HALF_UP

from .models import Coupon


def calculate_coupon_discount(coupon: Coupon, amount: Decimal) -> Decimal:
 
    if amount <= 0:
        return Decimal('0.00')

    amount = Decimal(amount)

    if coupon.discount_type == Coupon.DiscountType.PERCENTAGE:
        # amount * (percentage / 100)
        discount = (amount * coupon.amount / Decimal('100')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
    else:
        # fixed amount, not more than order amount
        discount = min(amount, coupon.amount)

    if discount < 0:
        discount = Decimal('0.00')

    return discount
