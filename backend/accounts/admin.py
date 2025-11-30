from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User, Profile, Address


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "is_staff", "is_active")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("-date_joined",)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "preferred_language", "is_verified")
    search_fields = ("user__username", "user__email", "phone")
    list_filter = ("is_verified", "preferred_language")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "user",
        "city",
        "country",
        "is_default",
    )
    list_filter = ("country", "city", "is_default")
    search_fields = (
        "full_name",
        "user__username",
        "line1",
        "city",
        "postal_code",
    )
