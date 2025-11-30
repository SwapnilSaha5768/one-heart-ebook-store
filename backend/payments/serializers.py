# backend/payments/serializers.py
from rest_framework import serializers

from .models import Payment


class ManualPaymentSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['payer_number', 'gateway_transaction_id', 'customer_note']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'gateway',
            'amount',
            'currency',
            'gateway_transaction_id',
            'status',
            'raw_response',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['status',
            'submitted_at',
            'verified_by',
            'verified_at',
            'created_at',
            'updated_at',]
