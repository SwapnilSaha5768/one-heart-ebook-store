from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "gateway",
        "amount",
        "currency",
        "status",
        "payer_number",
        "gateway_transaction_id",
        "submitted_at",
        "verified_by",
        "verified_at",
    )
    list_filter = ("gateway", "status", "currency")
    search_fields = (
        "order__order_number",
        "payer_number",
        "gateway_transaction_id",
        "order__user__username",
    )

    actions = ["mark_as_success", "mark_as_failed"]

    def mark_as_success(self, request, queryset):
        for payment in queryset:
            payment.mark_as_success(admin_user=request.user)
        self.message_user(request, "Selected payments marked as SUCCESS.")

    def mark_as_failed(self, request, queryset):
        for payment in queryset:
            payment.mark_as_failed(admin_user=request.user)
        self.message_user(request, "Selected payments marked as FAILED.")

    mark_as_success.short_description = "Mark selected payments as SUCCESS"
    mark_as_failed.short_description = "Mark selected payments as FAILED"
