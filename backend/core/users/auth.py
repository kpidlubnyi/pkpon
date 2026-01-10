import logging

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from core.services.redis import get_session
from .models import User



logger = logging.getLogger(__name__)


class RedisSessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        try:
            scheme, session_id = auth_header.split(' ', 1)
        except ValueError:
            return None

        if scheme != 'Session':
            return None

        session_id = session_id.strip()
        if not session_id:
            return None

        session_data = get_session(session_id)
        if not session_data:
            raise AuthenticationFailed('Sesja nie ważna!')

        try:
            user = User.objects.get(
                Id=session_data['user_id'],
                IsActive=1
            )
        except User.DoesNotExist:
            raise AuthenticationFailed('Uzytkownik nie istnieje lub nie jest aktywny!')

        return (user, session_id)
