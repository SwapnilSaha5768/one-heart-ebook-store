# backend/contact/views.py
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ContactSerializer

# optional: save to DB model
try:
    from .models import ContactMessage
except Exception:
    ContactMessage = None


class ContactView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ContactSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Save to DB for admin history (optional)
        if ContactMessage is not None:
            try:
                ContactMessage.objects.create(
                    first_name=data.get("first_name"),
                    last_name=data.get("last_name", ""),
                    email=data.get("email"),
                    subject=data.get("subject", "General Inquiry"),
                    message=data.get("message"),
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get("HTTP_USER_AGENT", "")[:1000],
                )
            except Exception:
                # don't block email send on db error
                pass

        # Build email context
        ctx = {
            "first_name": data.get("first_name"),
            "last_name": data.get("last_name", ""),
            "email": data.get("email"),
            "subject": data.get("subject", "General Inquiry"),
            "message": data.get("message"),
            "ip_address": self.get_client_ip(request) or "unknown",
            "user_agent": request.META.get("HTTP_USER_AGENT", "") or "",
            "year": getattr(settings, "YEAR", None) or __import__("datetime").datetime.now().year,
            # logo_url: prefer SITE_URL/static path if available; otherwise fall back to a hosted logo
            "logo_url": getattr(settings, "SITE_URL", "").rstrip("/") + "/static/logo.png"
                        if getattr(settings, "SITE_URL", None) else getattr(settings, "EMAIL_LOGO_URL", ""),
        }

        # if SITE_URL not set or logo missing, you can set EMAIL_LOGO_URL in .env / settings
        if not ctx["logo_url"]:
            # fallback to a public placeholder (replace later)
            ctx["logo_url"] = "https://via.placeholder.com/150x40?text=OneHeart+eBook"

        # Render HTML template
        html_body = render_to_string("emails/contact.html", ctx)

        # Plain text fallback (simple)
        text_lines = [
            f"New contact form submission",
            f"From: {ctx['first_name']} {ctx['last_name']}",
            f"Email: {ctx['email']}",
            f"Subject: {ctx['subject']}",
            "",
            "Message:",
            ctx["message"],
            "",
            f"IP: {ctx['ip_address']}",
            f"User-Agent: {ctx['user_agent']}",
        ]
        text_body = "\n".join(text_lines)

        subject = f"[Website Contact] {ctx['subject']}"
        from_email = getattr(settings, "DEFAULT_FROM_EMAIL")
        to_email = [getattr(settings, "SUPPORT_EMAIL", from_email)]

        try:
            msg = EmailMultiAlternatives(subject=subject, body=text_body, from_email=from_email, to=to_email, reply_to=[ctx["email"]])
            msg.attach_alternative(html_body, "text/html")
            msg.send(fail_silently=False)
        except Exception:
            return Response({"detail": "Failed to send message. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "Message sent successfully."}, status=status.HTTP_200_OK)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")
