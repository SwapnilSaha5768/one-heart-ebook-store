from django.urls import path
from .views import ManualPaymentSubmitView

urlpatterns = [
    path('payments/<int:order_id>/submit-manual/', ManualPaymentSubmitView.as_view(),
         name='manual-payment-submit'),
]
