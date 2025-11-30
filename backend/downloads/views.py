from datetime import timedelta
import secrets
from pathlib import Path

from django.conf import settings
from django.urls import reverse
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.throttles import DownloadThrottle
from .models import PurchaseItem, DownloadLink, DownloadLog
from .serializers import PurchaseItemSerializer


class LibraryListView(generics.ListAPIView):
    """
    GET /api/library/
    -> list of ebooks the current user owns (both active & pending)
    Frontend will show "Payment pending" if !is_active or payment_status != success.
    """
    serializer_class = PurchaseItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            PurchaseItem.objects
            .filter(user=self.request.user)  # ❗ no is_active filter here
            .select_related('book', 'order_item__order')
            .order_by('-purchased_at')
        )


class GenerateDownloadLinkView(APIView):
    """
    POST /api/library/<purchase_item_id>/download-link/
    Only works for active (paid/approved) purchases.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        purchase_item = get_object_or_404(
            PurchaseItem,
            pk=pk,
            user=request.user,
            is_active=True,  # only allow download for activated purchase
        )

        # generate a fresh random token
        token = secrets.token_urlsafe(32)
        # ❗ use datetime.timedelta, not timezone.timedelta
        expires_at = timezone.now() + timedelta(minutes=10)

        link = DownloadLink.objects.create(
            purchase_item=purchase_item,
            token=token,
            expires_at=expires_at,
            is_used_once=False,  # can be reused while valid
        )

        download_url = request.build_absolute_uri(
            reverse("download-ebook", args=[token])
        )

        return Response(
            {
                "token": token,
                "download_url": download_url,
                "expires_at": expires_at,
            },
            status=status.HTTP_201_CREATED,
        )


class DownloadEbookView(APIView):
    """
    GET /api/download/<token>/
    - does NOT require JWT (token itself is secret)
    """
    permission_classes = []  # token-based
    throttle_classes = [DownloadThrottle]

    def get(self, request, token, *args, **kwargs):
        # 1) find link with this token
        link = get_object_or_404(
            DownloadLink.objects.select_related("purchase_item__book"),
            token=token,
        )

        # 2) check expiry
        if link.expires_at and link.expires_at < timezone.now():
            # delete expired link so it can’t be reused
            link.delete()
            return Response(
                {"detail": "Download link has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        purchase_item = link.purchase_item
        book = purchase_item.book

        # 3) ensure file exists
        if not book.file:
            raise Http404("File not found.")

        # 4) log download + increment counter
        DownloadLog.objects.create(
            purchase_item=purchase_item,
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )
        purchase_item.downloads_count = (purchase_item.downloads_count or 0) + 1
        purchase_item.save(update_fields=["downloads_count"])

        # 5) optionally make link one-time:
        if link.is_used_once:
            link.delete()

        # 6) stream file
        filename = Path(book.file.name).name
        response = FileResponse(
            book.file.open("rb"),
            as_attachment=True,
            filename=filename,
        )
        return response
