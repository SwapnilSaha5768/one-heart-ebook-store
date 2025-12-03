# backend/accounts/emails.py
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
import datetime
import logging

logger = logging.getLogger(__name__)

def _common_ctx(user=None, extra=None):
    """
    Common template context used by all account emails.
    """
    ctx = {
        "user": user,
        "first_name": getattr(user, "first_name", "") or getattr(user, "username", ""),
        "logo_url": getattr(settings, "EMAIL_LOGO_URL", ""),
        "site_url": getattr(settings, "SITE_URL", "").rstrip("/") or "",
        "year": getattr(settings, "YEAR", None) or datetime.datetime.now().year,
    }
    if extra:
        ctx.update(extra)
    return ctx


def send_otp_email(user, code, *, expiry_minutes=10, ip_address=None, fail_silently=False):
    """
    Send OTP verification email (HTML + text).
    """
    ctx = _common_ctx(user, {
        "code": code,
        "expiry_minutes": expiry_minutes,
        "ip_address": ip_address or "unknown",
    })

    subject = "Your OneHeart eBook verification code"
    plain = render_to_string("emails/otp.txt", ctx)
    html = render_to_string("emails/otp.html", ctx)

    try:
        send_mail(
            subject=subject,
            message=plain,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html,
            fail_silently=fail_silently,
        )
    except Exception as e:
        logger.exception("Failed to send OTP email to %s", user.email)
        if not fail_silently:
            raise


def send_password_reset_email(user, *, code=None, reset_link=None, expiry_minutes=10, ip_address=None, fail_silently=False):
    """
    Send password-reset email. Supports either a reset_link (button) or a numeric code.
    """
    ctx = _common_ctx(user, {
        "code": code,
        "reset_link": reset_link,
        "expiry_minutes": expiry_minutes,
        "ip_address": ip_address or "unknown",
    })

    subject = "OneHeart eBook — Password reset instructions"
    plain = render_to_string("emails/reset_password.txt", ctx)
    html = render_to_string("emails/reset_password.html", ctx)

    try:
        send_mail(
            subject=subject,
            message=plain,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html,
            fail_silently=fail_silently,
        )
    except Exception as e:
        logger.exception("Failed to send password reset email to %s", user.email)
        if not fail_silently:
            raise
