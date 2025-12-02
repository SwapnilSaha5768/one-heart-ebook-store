# backend/catalog/models.py

from django.db import models
from django.utils.text import slugify
from .validators import validate_ebook_file_extension, validate_ebook_file_size
from core.models import TimeStampedModel
from django.db.models import Avg, Count

class Author(TimeStampedModel):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    website = models.URLField(blank=True)

    def __str__(self):
        return self.name


class Category(TimeStampedModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        related_name='children',    
        null=True,
        blank=True
    )

    class Meta:
        verbose_name_plural = 'categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        if self.parent:
            return f"{self.parent} → {self.name}"
        return self.name


class Tag(TimeStampedModel):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Book(TimeStampedModel):
    class FileFormat(models.TextChoices):
        PDF = 'pdf', 'PDF'
        EPUB = 'epub', 'EPUB'
        MOBI = 'mobi', 'MOBI'
        OTHER = 'other', 'Other'

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField()
    file = models.FileField(
        upload_to='books/files/',
        validators=[validate_ebook_file_extension, validate_ebook_file_size],
        blank=True,
        null=True,
    )

    pdf_password = models.CharField(
        max_length=64,
        blank=True,
        help_text="Password to open the protected PDF (optional).",
    )
    
    authors = models.ManyToManyField(Author, related_name='books')
    categories = models.ManyToManyField(Category, related_name='books', blank=True)
    tags = models.ManyToManyField(Tag, related_name='books', blank=True)

    cover_image = models.ImageField(upload_to="books/covers/", blank=True, null=True)
    sample_file = models.FileField(upload_to="books/samples/", blank=True, null=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=10, default='BDT')

    isbn = models.CharField(max_length=20, blank=True)
    language = models.CharField(max_length=100, default="Bangla")
    pages = models.PositiveIntegerField(blank=True, null=True)

    file_format = models.CharField(max_length=10, choices=FileFormat.choices, default=FileFormat.PDF)
    publication_date = models.DateField(blank=True, null=True)

    is_published = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def effective_price(self):
        return self.discount_price if self.discount_price else self.price

    @property
    def average_rating(self):
        from reviews.models import Review
        data = Review.objects.filter(book=self, is_approved=True).aggregate(avg=Avg('rating'))
        return data['avg'] or 0

    @property
    def reviews_count(self):
        from reviews.models import Review
        return Review.objects.filter(book=self, is_approved=True).count()