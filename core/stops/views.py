from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView

from stops.services.views import *



class AllStopsView(APIView):
    def get(self, request):
        stops = get_all_stops()
        return JsonResponse({'stops': stops}, status=status.HTTP_200_OK)
    

class StopView(APIView):
    def get(self, request, stop_id):
        stop = get_stop(stop_id)
        return JsonResponse(stop, status=status.HTTP_200_OK)