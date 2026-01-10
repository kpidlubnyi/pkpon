import re

from django.contrib.auth.hashers import check_password
from rest_framework import serializers

from ..models import User


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email już istnieje")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username już istnieje")
        
        if not 3 <= len(value) <= 32:
            raise serializers.ValidationError("Username musi mieć od 3 do 32 znaków")

        if not re.fullmatch(r'[A-Za-z0-9]+', value):
            raise serializers.ValidationError("Username może zawierać tylko litery łacińskie i cyfry")
        
        return value

    def validate_password(self, value):
        if not 8 <= len(value) <= 16:
            raise serializers.ValidationError("Hasło musi mieć od 8 do 16 znaków")

        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Hasło musi zawierać małą literę")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Hasło musi zawierać dużą literę")

        if not re.search(r'\d', value):
            raise serializers.ValidationError("Hasło musi zawierać cyfrę")

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Hasło musi zawierać znak specjalny")
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError("Użytkownika nie znaleziono")

        if not check_password(data['password'], user.password):
            raise serializers.ValidationError("Nieprawidłowe hasło")

        data['user'] = user
        return data
