from django.http import JsonResponse
from django.conf import settings
import os

def debug_settings(request):
    return JsonResponse({
        "DEBUG": settings.DEBUG,
        "USE_CLOUDINARY_ENV": os.environ.get("USE_CLOUDINARY"),
        "DEFAULT_FILE_STORAGE": getattr(settings, "DEFAULT_FILE_STORAGE", "Not Set"),
        "INSTALLED_APPS_HAS_CLOUDINARY": "cloudinary" in settings.INSTALLED_APPS,
        "MEDIA_URL": settings.MEDIA_URL,
    })
