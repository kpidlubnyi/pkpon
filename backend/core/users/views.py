from django.http import JsonResponse
from django.contrib.auth.hashers import make_password

from rest_framework.views import APIView
from rest_framework.status import (
    HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST
)

from core.services.redis import create_session, delete_session

from .serializers import SignupSerializer, LoginSerializer, BaseUserSerializer
from .permissions import IsAuthenticatedUser
from .auth import RedisSessionAuthentication
from .models import User


class SignUpView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create(
            email=serializer.validated_data['email'],
            username=serializer.validated_data['username'],
            password=make_password(serializer.validated_data['password'])
        )

        session_id = create_session(user)

        return JsonResponse({"session_id": session_id}, status=HTTP_201_CREATED)



class LoginView(APIView):
    authentication_classes = []
    permission_classes = [] 

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        session_id = create_session(user)

        return JsonResponse({"session_id": session_id}, status=HTTP_200_OK)


class LogoutView(APIView):
    authentication_classes = [RedisSessionAuthentication]
    permission_classes = [IsAuthenticatedUser]

    def post(self, request):
        session_id = getattr(request, 'auth', None)
        if not session_id:
            return JsonResponse(
                {"error": "Brak sesji do wylogowania"}, 
                status=HTTP_400_BAD_REQUEST
            )

        deleted = delete_session(session_id)
        if not deleted:
            return JsonResponse(
                {"error": "Sesja już nie istnieje"}, 
                status=HTTP_400_BAD_REQUEST
            )

        return JsonResponse(
            {"message": "Wylogowano pomyślnie"}, 
            status=HTTP_200_OK
        )


class ProfileView(APIView):
    authentication_classes = [RedisSessionAuthentication]
    permission_classes = [IsAuthenticatedUser]
    
    def get(self, request):
        return JsonResponse(
            {'user': BaseUserSerializer(request.user).data}, 
            status=HTTP_200_OK
        )