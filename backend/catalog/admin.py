from django.contrib import admin

from .models import Author, Category, Tag, Book


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ("name", "website")
    search_fields = ("name",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent")
    search_fields = ("name", "slug")
    list_filter = ("parent",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


class BookAuthorInline(admin.TabularInline):
    model = Book.authors.through
    extra = 1


class BookCategoryInline(admin.TabularInline):
    model = Book.categories.through
    extra = 1


class BookTagInline(admin.TabularInline):
    model = Book.tags.through
    extra = 1


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "slug",
        "price",
        "discount_price",
        "currency",
        "is_published",
        "pdf_password",
        "publication_date",
    )
    list_filter = ("is_published", "file_format", "language")
    search_fields = ("title", "description", "isbn")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [BookAuthorInline, BookCategoryInline, BookTagInline]
