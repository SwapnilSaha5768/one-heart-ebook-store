from datetime import timedelta
from pathlib import Path
import os
import environ

# ============================
# Base Directory
# ============================
BASE_DIR = Path(__file__).resolve().parent.parent

# ============================
# ENV INIT
# ============================
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# ============================
# SECURITY
# ============================
SECRET_KEY = env("SECRET_KEY")
DEBUG = env.bool("DEBUG", default=False)
ALLOWED_HOSTS = env("ALLOWED_HOSTS").split(",")

# ============================
# JWT SETTINGS
# ============================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# ============================
# Django Apps
# ============================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Custom apps
    'core',
    'accounts',
    'catalog',
    'orders',
    'payments',
    'downloads',
    'reviews',
    'coupons',
    'blog',
    'contact',

    # Third-party
    'rest_framework',
    'corsheaders',
    'django_filters',
]

# ============================
# Middleware
# ============================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add Whitenoise
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_CREDENTIALS = True

# ============================
# URLs & Templates
# ============================
ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ============================
# Database
# ============================
if env("DATABASE_URL", default=None):
    DATABASES = {
        'default': env.db("DATABASE_URL")
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': env("DB_NAME"),
            'USER': env("DB_USER"),
            'PASSWORD': env("DB_PASSWORD"),
            'HOST': env("DB_HOST"),
            'PORT': env("DB_PORT"),
        }
    }

# ============================
# Django REST Framework
# ============================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
    'DEFAULT_THROTTLE_RATES': {
        'login': '5/min',
        'download': '30/min',
    },
}

# ============================
# Media Files
# ============================
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Cloudinary Configuration
if env("USE_CLOUDINARY", default=False):
    INSTALLED_APPS += ['cloudinary_storage', 'cloudinary']
    
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': env('CLOUDINARY_CLOUD_NAME'),
        'API_KEY': env('CLOUDINARY_API_KEY'),
        'API_SECRET': env('CLOUDINARY_API_SECRET'),
    }
    
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# ============================
# Authentication
# ============================
AUTH_USER_MODEL = 'accounts.User'

# ============================
# Password Validators
# ============================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ============================
# Internationalization
# ============================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ============================
# Static Files
# ============================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============================
# CORS
# ============================
CORS_ALLOWED_ORIGINS_ENV = env("CORS_ALLOWED_ORIGINS", default="")
if CORS_ALLOWED_ORIGINS_ENV == "*":
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS_ENV.split(",")

# ============================
# Email (Brevo SMTP)
# ============================
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = env("EMAIL_HOST", default="smtp-relay.brevo.com")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)

EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")

DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="no-reply@oneheartbd.com")
EMAIL_LOGO_URL = env("EMAIL_LOGO_URL", default="")
