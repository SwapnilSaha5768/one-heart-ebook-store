# backend/catalog/validators.py

from django.core.exceptions import ValidationError

ALLOWED_EXTENSIONS = ('.pdf', '.epub')
MAX_FILE_SIZE_MB = 50


def validate_ebook_file_extension(value):
    name = value.name.lower()
    if not any(name.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise ValidationError(
            f"Only {', '.join(ALLOWED_EXTENSIONS)} files are allowed."
        )


def validate_ebook_file_size(value):
    filesize = value.size
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024

    if filesize > max_bytes:
        raise ValidationError(
            f"Ebook file too large. Max size is {MAX_FILE_SIZE_MB} MB."
        )
