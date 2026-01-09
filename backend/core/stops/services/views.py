from tasks.models import *
from stops.serializers import *



def get_all_stops():
    stops = Stop.objects.all().order_by('stop_name')
    return BaseStopSerializer(stops, many=True).data


def get_stop(stop_id):
    stop = Stop.objects.get(stop_id=stop_id)
    detailed_stop = StopDetailedSerializer(stop).data
    return detailed_stop
    