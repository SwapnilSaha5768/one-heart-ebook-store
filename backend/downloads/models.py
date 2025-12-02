#downloads/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

from core.models import TimeStampedModel
from catalog.models import Book
from orders.models import OrderItem


User = settings.AUTH_USER_MODEL


class PurchaseItem(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchased_items')
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    order_item = models.OneToOneField(OrderItem, on_delete=models.SET_NULL, null=True, blank=True)

    purchased_at = models.DateTimeField(default=timezone.now)

    download_limit = models.PositiveIntegerField(null=True, blank=True)
    downloads_count = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'book')

    def can_download(self):
        if not self.is_active:
            return False
        if self.download_limit is None:
            return True
        return self.downloads_count < self.download_limit


class DownloadLog(TimeStampedModel):
    purchase_item = models.ForeignKey(PurchaseItem, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)


class DownloadLink(TimeStampedModel):
    purchase_item = models.ForeignKey(PurchaseItem, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    is_used_once = models.BooleanField(default=False)

    def is_valid(self):
        return timezone.now() < self.expires_at
