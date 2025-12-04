from django.http import JsonResponse
from django.conf import settings
import os
from blog.models import Post

def debug_settings(request):
    latest_post = Post.objects.order_by('-created_at').first()
    image_info = "No posts found"
    
    if latest_post:
        image_field = latest_post.featured_image
        image_info = {
            "id": latest_post.id,
            "title": latest_post.title,
            "has_file": bool(image_field),
            "name": image_field.name if image_field else "None",
            "url": image_field.url if image_field else "None",
            "storage_class": image_field.storage.__class__.__name__ if image_field else "None",
            "storage_module": image_field.storage.__module__ if image_field else "None",
        }

    # Check keys
    cloudinary_config = getattr(settings, 'CLOUDINARY_STORAGE', {})
    keys_status = {
        "CLOUD_NAME": "***" + cloudinary_config.get('CLOUD_NAME', '')[-4:] if cloudinary_config.get('CLOUD_NAME') else "MISSING",
        "API_KEY": "PRESENT" if cloudinary_config.get('API_KEY') else "MISSING",
        "API_SECRET": "PRESENT" if cloudinary_config.get('API_SECRET') else "MISSING",
    }

    return JsonResponse({
        "DEBUG": settings.DEBUG,
        "USE_CLOUDINARY_ENV": os.environ.get("USE_CLOUDINARY"),
        "DEFAULT_FILE_STORAGE": getattr(settings, "DEFAULT_FILE_STORAGE", "Not Set"),
        "KEYS_STATUS": keys_status,
        "LATEST_POST_IMAGE": image_info
    })
