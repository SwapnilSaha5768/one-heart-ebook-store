# payments/models.py
from django.conf import settings
from django.db import models
from django.utils import timezone
from core.models import TimeStampedModel
from orders.models import Order

User = settings.AUTH_USER_MODEL


class Payment(TimeStampedModel):
    class Status(models.TextChoices):
        INITIATED = 'initiated', 'Initiated'          # created, waiting for user to send money
        PENDING = 'pending', 'Pending Review'        # (optional) for manual review step
        SUCCESS = 'success', 'Success'
        FAILED = 'failed', 'Failed / Cancelled'

    class Gateway(models.TextChoices):
        MANUAL_BKASH = 'manual_bkash', 'Manual bKash'
        MANUAL_NAGAD = 'manual_nagad', 'Manual Nagad'
        OTHER = 'other', 'Other'

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='payment'
    )
    gateway = models.CharField(
        max_length=50,
        choices=Gateway.choices,
        default=Gateway.MANUAL_BKASH,
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='BDT')

    # what gateway gave us (if any) – for manual this will be trx id
    gateway_transaction_id = models.CharField(max_length=255, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.INITIATED,
    )

    raw_response = models.JSONField(blank=True, null=True)

    # 🔹 manual payment fields (what user submits)
    payer_number = models.CharField(
        max_length=30,
        blank=True,
        help_text="Customer's bKash/Nagad number"
    )
    customer_note = models.TextField(
        blank=True,
        help_text="Optional note from customer"
    )
    submitted_at = models.DateTimeField(null=True, blank=True)

    # 🔹 admin verification info
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_payments',
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment for {self.order.order_number} [{self.status}]"

    # helper – called when admin approves
    def mark_as_success(self, admin_user=None):
        from downloads.models import PurchaseItem  # local import

        if self.status == self.Status.SUCCESS:
            return

        self.status = self.Status.SUCCESS
        self.verified_by = admin_user
        self.verified_at = timezone.now()
        self.save(update_fields=['status', 'verified_by', 'verified_at'])

        order = self.order
        order.status = order.Status.PAID
        order.paid_at = timezone.now()
        order.save(update_fields=['status', 'paid_at'])

    # 🔹 activate all purchase items for this order
        PurchaseItem.objects.filter(
        order_item__order=order
    ).update(is_active=True)


    # helper – called when admin rejects
    def mark_as_failed(self, admin_user=None):
        """
        Called when admin rejects / cancels the payment.
        """
        from downloads.models import PurchaseItem  # local import to avoid circular

        if self.status == self.Status.FAILED:
            return

        self.status = self.Status.FAILED
        self.verified_by = admin_user
        self.verified_at = timezone.now()
        self.save(update_fields=['status', 'verified_by', 'verified_at'])

        order = self.order
        order.status = order.Status.FAILED
        order.save(update_fields=['status'])

        # make sure any related purchase items are inactive
        PurchaseItem.objects.filter(
            order_item__order=order
        ).update(is_active=False)
