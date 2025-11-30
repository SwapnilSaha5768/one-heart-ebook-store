# backend/coupons/views.py

from decimal import Decimal

from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Coupon, CouponRedemption
from .serializers import CouponSerializer
from .utils import calculate_coupon_discount

User = settings.AUTH_USER_MODEL


class CouponViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/coupons/         -> list (admin only)
    /api/coupons/<id>/    -> retrieve (admin only)
    """
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAdminUser]


class ApplyCouponView(APIView):
    """
    POST /api/coupons/apply/

    Body:
    {
      "code": "NEWUSER50",
      "amount": "1000.00"   # order/cart total BEFORE discount
    }

    Response:
    {
      "code": "NEWUSER50",
      "discount_type": "percentage",
      "discount_value": "50.00",
      "original_amount": "1000.00",
      "discount_amount": "500.00",
      "final_amount": "500.00"
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        code = request.data.get('code') or request.data.get('coupon_code')
        raw_amount = request.data.get('amount')

        if not code:
            return Response(
                {"detail": "Coupon code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if raw_amount is None:
            return Response(
                {"detail": "Amount is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amount = Decimal(str(raw_amount))
        except Exception:
            return Response(
                {"detail": "Amount must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            coupon = Coupon.objects.get(code__iexact=code.strip())
        except Coupon.DoesNotExist:
            return Response(
                {"detail": "Invalid coupon code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not coupon.is_valid_now():
            return Response(
                {"detail": "Coupon is not currently valid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Optional: only allow coupon once per user
        if CouponRedemption.objects.filter(
            coupon=coupon,
            user=request.user,
        ).exists():
            return Response(
                {"detail": "You have already used this coupon."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        discount = calculate_coupon_discount(coupon, amount)
        final_amount = max(Decimal('0.00'), amount - discount)

        return Response(
            {
                "code": coupon.code,
                "discount_type": coupon.discount_type,
                "discount_value": str(coupon.amount),
                "original_amount": str(amount),
                "discount_amount": str(discount),
                "final_amount": str(final_amount),
            },
            status=status.HTTP_200_OK,
        )
