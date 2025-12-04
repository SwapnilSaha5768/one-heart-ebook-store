from django.http import JsonResponse
from django.conf import settings
import os
from blog.models import Post

def debug_settings(request):
    # Get latest by ID to be sure
    latest_post = Post.objects.order_by('-id').first()
    
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
        }

    # Check Database
    db_settings = settings.DATABASES['default']
    db_info = {
        "ENGINE": db_settings.get('ENGINE'),
        "NAME": db_settings.get('NAME'),
        "HOST": db_settings.get('HOST'),
    }

    return JsonResponse({
        "DEBUG": settings.DEBUG,
        "USE_CLOUDINARY_ENV": os.environ.get("USE_CLOUDINARY"),
        "DEFAULT_FILE_STORAGE": getattr(settings, "DEFAULT_FILE_STORAGE", "Not Set"),
        "DB_INFO": db_info,
        "LATEST_POST_IMAGE": image_info
    })
