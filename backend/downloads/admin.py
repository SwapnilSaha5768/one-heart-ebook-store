from django.contrib import admin

from .models import PurchaseItem, DownloadLink, DownloadLog


@admin.register(PurchaseItem)
class PurchaseItemAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "book",
        "order_item",
        "download_limit",
        "downloads_count",
        "is_active",
        "purchased_at",
    )
    list_filter = ("is_active",)
    search_fields = ("user__username", "book__title", "order_item__order__order_number")


@admin.register(DownloadLink)
class DownloadLinkAdmin(admin.ModelAdmin):
    list_display = (
        "purchase_item",
        "token",
        "expires_at",
        "is_used_once",
        "created_at",
    )
    search_fields = ("token", "purchase_item__book__title", "purchase_item__user__username")
    list_filter = ("is_used_once",)


@admin.register(DownloadLog)
class DownloadLogAdmin(admin.ModelAdmin):
    list_display = (
        "purchase_item",
        "ip_address",
        "user_agent",
        "downloaded_at",
    )
    search_fields = (
        "purchase_item__book__title",
        "purchase_item__user__username",
        "ip_address",
    )
    list_filter = ("downloaded_at",)
