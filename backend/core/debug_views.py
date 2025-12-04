from django.http import JsonResponse
from django.conf import settings
import os
from blog.models import Post

def debug_settings(request):
    latest_post = Post.objects.first()
    image_info = "No posts found"
    if latest_post and latest_post.featured_image:
        image_info = {
            "name": latest_post.featured_image.name,
            "url": latest_post.featured_image.url,
            "storage": latest_post.featured_image.storage.__class__.__name__,
            "backend_storage": settings.DEFAULT_FILE_STORAGE
        }

    return JsonResponse({
        "DEBUG": settings.DEBUG,
        "USE_CLOUDINARY_ENV": os.environ.get("USE_CLOUDINARY"),
        "DEFAULT_FILE_STORAGE": getattr(settings, "DEFAULT_FILE_STORAGE", "Not Set"),
        "INSTALLED_APPS_HAS_CLOUDINARY": "cloudinary" in settings.INSTALLED_APPS,
        "MEDIA_URL": settings.MEDIA_URL,
        "LATEST_IMAGE_INFO": image_info
    })
