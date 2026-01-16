from trips.serializers import BaseCompleteTripSerializer, BaseTripSerializer
from trips.models import CompleteTrip
from tasks.models import Trip
from core.services.redis import get_cached_trip, set_cached_trip


def get_trip(trip_id) -> dict:
    if (cached_trip:=get_cached_trip(trip_id)):
        return cached_trip
    
    completed_trip = CompleteTrip.objects.get(trip_ids__contains=[trip_id])
    
    if len(completed_trip.trip_ids) > 1:
        serialized_trip = BaseCompleteTripSerializer(completed_trip).data 
        
        for trip_id in completed_trip.trip_ids:
            set_cached_trip(trip_id, serialized_trip)
    
    else:
        trip = Trip.objects.get(trip_id=trip_id)
        serialized_trip = BaseTripSerializer(trip).data
        
        set_cached_trip(trip_id, serialized_trip)

    return serialized_trip
