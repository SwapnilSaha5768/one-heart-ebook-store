# backend/orders/emails.py
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

def send_payment_confirmed_email(order):
    """
    Send an HTML email to the buyer with book credentials.
    """
    user = order.user
    to_email = user.email
    items = list(order.items.select_related("book").all())

    context = {
        "user": user,
        "order": order,
        "items": items,
        "site_url": getattr(settings, "SITE_URL", "").rstrip("/") or "",
        "logo_url": getattr(settings, "EMAIL_LOGO_URL", ""),
        "year": getattr(settings, "YEAR", None) or __import__("datetime").datetime.now().year,
    }

    subject = f"Payment Confirmed — Order #{order.order_number}"

    html_message = render_to_string("emails/order_confirm.html", context)
    plain_message = render_to_string("emails/order_confirm.txt", context)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )

def send_order_notification_admin(order):
    """
    Send a notification email to the site admin / from address when an order is placed.
    """
    user = order.user
    items = list(order.items.select_related("book").all())

    context = {
        "user": user,
        "order": order,
        "items": items,
        "site_url": getattr(settings, "SITE_URL", "").rstrip("/") or "",
    }

    subject = f"New Order Placed — #{order.order_number}"
    admin_email = settings.DEFAULT_FROM_EMAIL  # no-reply / admin

    html_message = render_to_string("emails/order_notification_admin.html", context)
    plain_message = render_to_string("emails/order_notification_admin.txt", context)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=admin_email,
        recipient_list=[admin_email],
        html_message=html_message,
        fail_silently=False,
    )
