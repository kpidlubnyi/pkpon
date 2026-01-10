from rest_framework import serializers

from users.models import User


class BaseUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'user_id',
            'username',
            'email',
            'created_at',
        )
