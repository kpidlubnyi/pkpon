from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView

from .services.views import get_trip


class TripView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, trip_id):
        trip = get_trip(trip_id)
        return JsonResponse(trip, status=status.HTTP_200_OK)
