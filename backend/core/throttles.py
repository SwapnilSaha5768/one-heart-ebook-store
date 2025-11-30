# backend/core/throttles.py

from rest_framework.throttling import SimpleRateThrottle


class LoginThrottle(SimpleRateThrottle):
    """
    Limit login attempts per IP.
    """
    scope = 'login'

    def get_cache_key(self, request, view):
        # throttle by IP only
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }


class DownloadThrottle(SimpleRateThrottle):
    """
    Limit downloads per user (or IP if anonymous).
    """
    scope = 'download'

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = f"user-{request.user.id}"
        else:
            ident = f"ip-{self.get_ident(request)}"

        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }
