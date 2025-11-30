from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "book",
        "user",
        "rating",
        "is_approved",
        "created_at",
    )
    list_filter = ("is_approved", "rating", "created_at")
    search_fields = ("book__title", "user__username", "title", "body")

    actions = ["approve_reviews", "unapprove_reviews"]

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, "Selected reviews approved.")

    def unapprove_reviews(self, request, queryset):
        queryset.update(is_approved=False)
        self.message_user(request, "Selected reviews unapproved.")

    approve_reviews.short_description = "Mark selected reviews as approved"
    unapprove_reviews.short_description = "Mark selected reviews as unapproved"
