# backend/blog/models.py
from django.conf import settings
from django.db import models
from django.utils.text import slugify

from core.models import TimeStampedModel

User = settings.AUTH_USER_MODEL


class Post(TimeStampedModel):
    """
    Simple blog post model.
    Content is plain TextField for now – you can paste HTML from a rich text editor.
    """
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)

    summary = models.TextField(
        blank=True,
        help_text="Short summary/abstract shown in list views."
    )

    # Treat this as rich text / HTML string from admin or future editor
    content = models.TextField(
        help_text="Full article content. Can contain HTML."
    )

    featured_image = models.ImageField(
        upload_to="blog/featured/",
        blank=True,
        null=True,
    )

    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="blog_posts",
    )

    is_published = models.BooleanField(default=True)

    # Optional: schedule
    published_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When the post was (or will be) published."
    )

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # auto-slugify if missing
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            num = 1
            from .models import Post  # avoid circular in some cases
            while Post.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{num}"
                num += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
