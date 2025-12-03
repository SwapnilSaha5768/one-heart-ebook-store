# backend/orders/views.py
from downloads.models import PurchaseItem
import uuid
from decimal import Decimal

from django.utils import timezone
from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemAddSerializer, OrderSerializer, AdminOrderSerializer
from accounts.models import Address
from payments.models import Payment
from coupons.models import Coupon, CouponRedemption
from coupons.utils import calculate_coupon_discount
from .emails import send_payment_confirmed_email, send_order_notification_admin

def generate_order_number() -> str:
    """
    Simple order number generator.
    You can replace with something like: EBOOK-YYYYMMDD-XXXX
    """
    return uuid.uuid4().hex[:12].upper()


def get_or_create_user_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    """
    GET /api/cart/   -> current user's cart
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        cart = get_or_create_user_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemAddView(APIView):
    """
    POST /api/cart/items/
    Body: { "book_id": 1, "quantity": 1 }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cart = get_or_create_user_cart(request.user)
        serializer = CartItemAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        book = serializer.validated_data["book"]
        quantity = serializer.validated_data["quantity"]

        # unit price from book.effective_price
        unit_price = Decimal(book.effective_price)

        # if already in cart, increase quantity
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            book=book,
            defaults={"quantity": quantity, "unit_price": unit_price},
        )
        if not created:
            item.quantity += quantity
            item.unit_price = unit_price
            item.save()

        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data, status=status.HTTP_201_CREATED)


class CartItemUpdateView(APIView):
    """
    PATCH /api/cart/items/<id>/
    Body: { "quantity": 2 }

    DELETE /api/cart/items/<id>/
    -> remove item
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        try:
            item = CartItem.objects.select_related("cart").get(
                pk=pk,
                cart__user=request.user,
            )
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        quantity = request.data.get("quantity")
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Quantity must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

        cart = get_or_create_user_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def delete(self, request, pk, *args, **kwargs):
        try:
            item = CartItem.objects.select_related("cart").get(
                pk=pk,
                cart__user=request.user,
            )
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        cart = item.cart
        item.delete()

        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CheckoutView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        cart = get_or_create_user_cart(user)
        cart_items = cart.items.select_related('book')

        if not cart_items.exists():
            return Response(
                {'detail': 'Cart is empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1) billing address
        billing_address = None
        billing_address_id = request.data.get('billing_address_id')
        if billing_address_id:
            billing_address = Address.objects.filter(
                id=billing_address_id,
                user=user
            ).first()

        # 2) payment info from frontend
        payment_method = request.data.get('payment_method', 'manual_bkash')
        payer_number = request.data.get('payer_number', '').strip()
        transaction_id = request.data.get('transaction_id', '').strip()
        customer_note = request.data.get('customer_note', '').strip()

        # 3) calculate total BEFORE coupon
        total = Decimal('0.00')
        for item in cart_items:
            total += item.subtotal

        # 4) coupon
        coupon_code = request.data.get('coupon_code')
        coupon = None
        discount_amount = Decimal('0.00')

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code.strip())
            except Coupon.DoesNotExist:
                return Response(
                    {'detail': 'Invalid coupon code.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not coupon.is_valid_now():
                return Response(
                    {'detail': 'Coupon is not currently valid.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # optional: one use per user
            if CouponRedemption.objects.filter(
                coupon=coupon,
                user=user
            ).exists():
                return Response(
                    {'detail': 'You have already used this coupon.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            discount_amount = calculate_coupon_discount(coupon, total)
            total = max(Decimal('0.00'), total - discount_amount)


        # 5) create order (payment still pending)
        order = Order.objects.create(
            user=user,
            order_number=generate_order_number(),
            status=Order.Status.PENDING,  # waiting for payment confirmation
            total_amount=total,
            currency='BDT',
            payment_method=payment_method,
            billing_address=billing_address,
        )

        # 6) create order items + "pending" purchase items (not active yet)
        for item in cart_items:
            order_item = OrderItem.objects.create(
                order=order,
                book=item.book,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            )

            # Because of unique_together (user, book), we must NOT always create.
            purchase, created = PurchaseItem.objects.get_or_create(
                user=user,
                book=item.book,
                defaults={
                    "order_item": order_item,
                    "download_limit": None,
                    "downloads_count": 0,
                    "is_active": False,
                },
            )

            if not created:
                # user already has this book → attach to latest order
                purchase.order_item = order_item
                purchase.is_active = False  # locked until payment success
                purchase.save(update_fields=["order_item", "is_active"])

        # 7) clear cart
        cart_items.delete()

        # --- NEW: notify admin/no-reply that an order was placed ---
        try:
            send_order_notification_admin(order)
        except Exception as e:
            # don't fail the checkout if email sending fails; just log
            print("Failed to send admin order notification:", e)
        # ---------------------------------------------------------

        # 8) create payment record with status=INITIATED
        payment = Payment.objects.create(
            order=order,
            gateway=payment_method,   # e.g. manual_bkash / manual_nagad
            amount=total,
            currency='BDT',
            status=Payment.Status.INITIATED,
            payer_number=payer_number or None,
            gateway_transaction_id=transaction_id or None,
            customer_note=customer_note or "",
        )

        # 9) record coupon redemption (if any)
        if coupon and discount_amount > 0:
            CouponRedemption.objects.create(
                coupon=coupon,
                user=user,
                order=order,
            )
            coupon.uses_count = (coupon.uses_count or 0) + 1
            coupon.save(update_fields=['uses_count'])

        serializer = OrderSerializer(order)
        data = serializer.data
        # attach payment status for frontend convenience
        data['payment'] = {
            'id': payment.id,
            'status': payment.status,
            'gateway': payment.gateway,
            'payer_number': payment.payer_number,
            'gateway_transaction_id': payment.gateway_transaction_id,
        }
        return Response(data, status=status.HTTP_201_CREATED)

      


class OrderListView(generics.ListAPIView):
    """
    GET /api/orders/
    -> list current user's orders
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .order_by("-created_at")
        )


class OrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/orders/<id>/
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class AdminOrderListView(generics.ListAPIView):
    """
    GET /api/orders/admin/
    -> list ALL orders (admin only)
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Order.objects.all().order_by("-created_at")


class AdminOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/orders/admin/<pk>/
    PATCH /api/orders/admin/<pk>/  -> update status
    DELETE /api/orders/admin/<pk>/
    """
    serializer_class = AdminOrderSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Order.objects.all()


