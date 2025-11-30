# backend/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
import random
import string

from core.models import TimeStampedModel   # <- note: no "apps." prefix


class User(AbstractUser):
    """
    Custom user model.
    Make sure to set AUTH_USER_MODEL = 'accounts.User' in settings.py
    """
    email = models.EmailField(_('email address'), unique=True)


    def __str__(self):
        # prefer email if available
        return self.email or self.username


class Profile(TimeStampedModel):
    user = models.OneToOneField(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='profile'
    )
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    preferred_language = models.CharField(max_length=10, blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Profile of {self.user}"


class Address(TimeStampedModel):
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='addresses'
    )
    full_name = models.CharField(max_length=255)
    line1 = models.CharField(max_length=255)
    line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default='Bangladesh')
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.full_name} - {self.city}"



