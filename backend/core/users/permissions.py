from rest_framework.permissions import BasePermission
from core.services.redis import get_session


class IsAuthenticatedUser(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user:
            return False

        session_id = getattr(request, 'auth', None)
        if not session_id:
            return False

        session_data = get_session(session_id)
        if not session_data:
            return False

        return session_data.get('user_id') == user.Id

