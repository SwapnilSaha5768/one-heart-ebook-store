# #orders/admin.py
# from django.contrib import admin
# from .models import Cart, CartItem, Order, OrderItem


# class CartItemInline(admin.TabularInline):
#     model = CartItem
#     extra = 0


# @admin.register(Cart)
# class CartAdmin(admin.ModelAdmin):
#     list_display = ("id", "user", "session_id", "created_at", "updated_at")
#     search_fields = ("user__username", "session_id")
#     inlines = [CartItemInline]


# class OrderItemInline(admin.TabularInline):
#     model = OrderItem
#     extra = 0


# @admin.register(Order)
# class OrderAdmin(admin.ModelAdmin):
#     list_display = (
#         "order_number",
#         "user",
#         "status",
#         "total_amount",
#         "currency",
#         "payment_method",
#         "created_at",
#         "paid_at",
#     )
#     list_filter = ("status", "payment_method", "currency")
#     search_fields = ("order_number", "user__username", "user__email")
#     inlines = [OrderItemInline]


# @admin.register(OrderItem)
# class OrderItemAdmin(admin.ModelAdmin):
#     list_display = ("order", "book", "quantity", "unit_price", "subtotal")
#     search_fields = ("order__order_number", "book__title")

# backend/orders/admin.py

from django.contrib import admin
from django.utils import timezone
from .models import Cart, CartItem, Order, OrderItem
from .emails import send_payment_confirmed_email  # <-- important


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "session_id", "created_at", "updated_at")
    search_fields = ("user__username", "session_id")
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "user",
        "status",
        "total_amount",
        "currency",
        "payment_method",
        "created_at",
        "paid_at",
    )
    list_filter = ("status", "payment_method", "currency")
    search_fields = ("order_number", "user__username", "user__email")
    inlines = [OrderItemInline]

    def save_model(self, request, obj, form, change):
        """
        When admin changes status → if changed to PAID send customer email.
        """
        old_status = None
        if change:
            old_status = Order.objects.get(pk=obj.pk).status

        super().save_model(request, obj, form, change)

        # Only trigger email when status actually changes to PAID
        if old_status != obj.status and obj.status == Order.Status.PAID:
            if obj.paid_at is None:
                obj.paid_at = timezone.now()
                obj.save(update_fields=["paid_at"])

            try:
                send_payment_confirmed_email(obj)
            except Exception as e:
                print("Failed to send order confirmation email:", e)



@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "book", "quantity", "unit_price", "subtotal")
    search_fields = ("order__order_number", "book__title")
