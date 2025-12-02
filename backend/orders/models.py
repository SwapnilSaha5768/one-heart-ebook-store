# backend/orders/models.py

from django.db import models
from django.conf import settings

from core.models import TimeStampedModel
from catalog.models import Book
from accounts.models import Address


User = settings.AUTH_USER_MODEL


class Cart(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Cart {self.id}"


class CartItem(TimeStampedModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('cart', 'book')

    @property
    def subtotal(self):
        return self.quantity * self.unit_price


class Order(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = 'pending'
        PAID = 'paid'
        FAILED = 'failed'
        CANCELLED = 'cancelled'
        REFUNDED = 'refunded'

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_number = models.CharField(max_length=100, unique=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=20, default="BDT")

    payment_method = models.CharField(max_length=50, blank=True)
    billing_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)

    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Order {self.order_number}"


class OrderItem(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)

    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.book.title} x {self.quantity}"
