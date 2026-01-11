from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView

from .serializers import BaseCompleteTripSerializer
from .services.views import get_trip


class TripView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, trip_id):
        trip = get_trip(trip_id)
        serialized_trip = BaseCompleteTripSerializer(trip).data
        return JsonResponse(serialized_trip, status=status.HTTP_200_OK)
