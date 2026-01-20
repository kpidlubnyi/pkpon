from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView

from trips.services.views import get_trip, find_matching_trips
from trips.serializers import UserTripSearchSerializer, BaseCompleteTripSerializer


class TripView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, trip_id):
        trip = get_trip(trip_id)
        return JsonResponse(trip, status=status.HTTP_200_OK)


class UserTripsView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        srl = UserTripSearchSerializer(data=request.query_params)
        srl.is_valid(raise_exception=True)

        q_params = srl.validated_data
        date = q_params['date']
        time = q_params['time']
        from_stop = q_params['from_stop']
        to_stop = q_params['to_stop']

        matching_trips = find_matching_trips(from_stop, to_stop, date, time)
        serialized = BaseCompleteTripSerializer(matching_trips, many=True).data

        return JsonResponse({'matching_trips': serialized}, status=status.HTTP_200_OK)