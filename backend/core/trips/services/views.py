from trips.serializers import BaseCompleteTripSerializer
from trips.models import CompleteTrip
from core.services.redis import get_cached_trip, set_cached_trip


def get_trip(trip_id) -> dict:
    if (cached_trip:=get_cached_trip(trip_id)):
        return cached_trip
    
    completed_trip = CompleteTrip.objects.get(trip_ids__contains=[trip_id])
    serialized_trip = BaseCompleteTripSerializer(completed_trip).data 
    
    for trip_id in completed_trip.trip_ids:
        set_cached_trip(trip_id, serialized_trip)
    
    return serialized_trip
