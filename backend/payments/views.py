# backend/payments/views.py

from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from orders.models import Order
from .models import Payment
from .serializers import ManualPaymentSubmitSerializer, PaymentSerializer


class ManualPaymentSubmitView(APIView):
    """
    POST /api/payments/<int:order_id>/submit-manual/

    Body:
    {
      "payer_number": "01XXXXXXXXX",
      "gateway_transaction_id": "TXID123456",
      "customer_note": "Sent from my personal bKash"
    }

    - Only the owner of the order can submit.
    - Sets payment.status = PENDING (waiting for admin review).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id, *args, **kwargs):
        order = get_object_or_404(Order, id=order_id, user=request.user)

        try:
            payment = order.payment
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment record not found for this order."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ManualPaymentSubmitSerializer(payment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        payment = serializer.save(
            submitted_at=timezone.now(),
            status=Payment.Status.PENDING,   # now waiting for admin
        )

        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)
