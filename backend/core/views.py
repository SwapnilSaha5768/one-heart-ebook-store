from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth import get_user_model
from django.db.models import Sum
from orders.models import Order

User = get_user_model()

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_orders = Order.objects.count()
        total_sales = Order.objects.filter(status=Order.Status.PAID).aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        active_users = User.objects.count()

        return Response({
            "total_orders": total_orders,
            "total_sales": total_sales,
            "active_users": active_users,
        })
