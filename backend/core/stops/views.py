from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView

from stops.serializers import *


class AllStopsView(APIView):
    def get(self, request):
        stops = get_all_stops()
        serialized = BaseStopSerializer(stops, many=True).data
        return JsonResponse({'stops': serialized}, status=status.HTTP_200_OK)
    

class StopScheduleView(APIView):
    def get(self, request, stop_id):
        srl = StopScheduleSerializer(data=request.query_params)
        srl.is_valid(raise_exception=True)

        q_params = srl.validated_data
        date = q_params['date']
        time = q_params['time']
        direction = q_params['direction']

        schedule = get_stop_schedule(stop_id, direction, date, time)
        serialized = BaseStopTimeSerializer(schedule, many=True).data
        
        return JsonResponse({'schedule': serialized}, status=status.HTTP_200_OK)
