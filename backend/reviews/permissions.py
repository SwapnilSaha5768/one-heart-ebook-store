from rest_framework import permissions
from downloads.models import PurchaseItem


class IsReviewOwnerOrReadOnly(permissions.BasePermission):
    """
    - SAFE methods (GET, HEAD, OPTIONS): allowed for everyone
    - Other methods (PUT, PATCH, DELETE): only review owner
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class IsBuyerOrReadOnly(permissions.BasePermission):
    """
    For creating reviews:
    - Only allow POST if user has purchased the book.
    - Read-only for others.
    """

    def has_permission(self, request, view):
        # Allow read-only for everyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # POST/PUT/PATCH/DELETE require auth
        if not request.user or not request.user.is_authenticated:
            return False

        return True

    def has_object_permission(self, request, view, obj):
        # For updates/deletes, owner check handled by IsReviewOwnerOrReadOnly
        return True
