from django.urls import path

from .views import (
    LibraryListView,
    GenerateDownloadLinkView,
    DownloadEbookView,
)

urlpatterns = [
    path('library/', LibraryListView.as_view(), name='library'),
    path('library/<int:pk>/download-link/', GenerateDownloadLinkView.as_view(),
         name='generate-download-link'),
    path('download/<str:token>/', DownloadEbookView.as_view(),
         name='download-ebook'),
]
