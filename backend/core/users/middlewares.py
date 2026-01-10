import re

from django.http import JsonResponse
from rest_framework.status import HTTP_401_UNAUTHORIZED as _401
from rest_framework.status import HTTP_403_FORBIDDEN as _403

from core.services.redis import get_session


class SessionActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.excluded_patterns = [
            re.compile(r'^/stops/'),
            re.compile(r'^/users/(signup|login|logout)/'),
            re.compile(r'^/health/'),
        ]

    def __call__(self, request):
        if any(pattern.match(request.path) for pattern in self.excluded_patterns):
            return self.get_response(request)
            
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if auth_header.startswith('Session '):
            session_id = auth_header.replace('Session ', '')

            if not session_id.strip():
                return JsonResponse({
                    'error': 'Sesja nie istnieje, zaloguj się ponownie!',
                }, status=_401)
                
            session_data = get_session(session_id)
            
            if not session_data:
                return JsonResponse({
                    'error': 'Sesja jest nie ważna, zaloguj się ponownie!',
                }, status=_401)
            
        elif not any(pattern.match(request.path) for pattern in self.excluded_patterns):
            return JsonResponse({
                'error': 'Brak autoryzacji!',
            }, status=403)

        
        return self.get_response(request)