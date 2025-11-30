from django.urls import path
from .views import CouponViewSet, ApplyCouponView

coupon_list  = CouponViewSet.as_view({'get': 'list'})
coupon_detail = CouponViewSet.as_view({'get': 'retrieve'})

urlpatterns = [
    path('coupons/', coupon_list, name='coupon-list'),
    path('coupons/<int:pk>/', coupon_detail, name='coupon-detail'),
    path('coupons/apply/', ApplyCouponView.as_view(), name='coupon-apply'),
]
