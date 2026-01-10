from rest_framework.views import APIView

from .models import User

class SighUpView(APIView):
    def post(self, request):
        ...