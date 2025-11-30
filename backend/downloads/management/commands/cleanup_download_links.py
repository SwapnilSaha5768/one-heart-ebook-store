from django.core.management.base import BaseCommand
from django.utils import timezone

from downloads.models import DownloadLink, DownloadLog


class Command(BaseCommand):
    help = "Delete expired download links and old download logs."

    def add_arguments(self, parser):
        parser.add_argument(
            "--logs-days",
            type=int,
            default=90,
            help="Delete download logs older than this many days (default: 90)",
        )

    def handle(self, *args, **options):
        now = timezone.now()

        # Delete expired download links
        expired_links = DownloadLink.objects.filter(expires_at__lt=now)
        num_links = expired_links.count()
        expired_links.delete()

        # Delete old logs
        days = options["logs_days"]
        cutoff = now - timezone.timedelta(days=days)
        old_logs = DownloadLog.objects.filter(downloaded_at__lt=cutoff)
        num_logs = old_logs.count()
        old_logs.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {num_links} expired links and {num_logs} logs older than {days} days."
            )
        )
