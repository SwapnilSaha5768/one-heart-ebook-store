

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth & user APIs
    path('api/auth/', include('accounts.urls')),
    path('api/', include('catalog.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('downloads.urls')), 
    path('api/', include('reviews.urls')),
    path('api/', include('coupons.urls')),
    path('api/', include('payments.urls')),
    path("api/", include("blog.urls")),
    path("api/contact/", include("contact.urls")),
    path("api/", include("core.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
