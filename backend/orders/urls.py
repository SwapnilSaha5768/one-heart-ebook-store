from django.urls import path

from .views import (
    CartView,
    CartItemAddView,
    CartItemUpdateView,
    CheckoutView,
    OrderListView,
    OrderDetailView,
    AdminOrderListView,
    AdminOrderDetailView,
)

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart-detail'),
    path('cart/items/', CartItemAddView.as_view(), name='cartitem-add'),
    path('cart/items/<int:pk>/', CartItemUpdateView.as_view(), name='cartitem-update'),

    path('checkout/', CheckoutView.as_view(), name='checkout'),

    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('orders/admin/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
]
