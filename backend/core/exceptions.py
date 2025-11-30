# backend/core/exceptions.py

from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Wrap DRF's default handler so:
      - known DRF errors stay as they are
      - unknown exceptions become: { "detail": "Internal server error." }
    """
    response = drf_exception_handler(exc, context)

    if response is not None:
        # Already a DRF-handled error (ValidationError, NotFound, etc.)
        return response

    # Anything else (uncaught exception) -> clean JSON error
    return Response(
        {"detail": "Internal server error."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
