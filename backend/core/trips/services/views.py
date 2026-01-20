from datetime import datetime

from core.services.redis import get_cached_trip, set_cached_trip
from stops.services.views import normalize_time
from tasks.models import *
from trips.serializers import BaseCompleteTripSerializer
from trips.models import CompleteTrip


def get_trip(trip_id) -> dict:
    if (cached_trip:=get_cached_trip(trip_id)):
        return cached_trip
    
    completed_trip = CompleteTrip.objects.get(trip_ids__contains=[trip_id])
    serialized_trip = BaseCompleteTripSerializer(completed_trip).data 
    
    for trip_id in completed_trip.trip_ids:
        set_cached_trip(trip_id, serialized_trip)
    
    return serialized_trip


def find_matching_trips(from_stop:str, to_stop:str, date_:datetime.date, time_:datetime.time) -> list:
    def trip_matches_by_stops(trip_stops:list[str], searching_for:tuple[str, str]) -> bool:
        i = 0
        
        for stop in trip_stops:
            if stop == searching_for[i]:
                if i == 1:
                    return True
                i += 1

        return False  
    
    dt = datetime.combine(date_, time_)
    date_str, time_str = dt.strftime('%Y-%m-%d %H:%M:%S').split()
    trips_stops_matching_by_date = CompleteTrip.objects.filter(trip_ids__0__startswith=date_str)
    
    trips_matching_by_stops = [
        trip
        for trip in trips_stops_matching_by_date
        if trip_matches_by_stops(trip.stops, (from_stop, to_stop)) 
    ]
    
    matching_trips = []
    for complete_trip in trips_matching_by_stops:
        for trip_id in complete_trip.trip_ids:
            stop_times = StopTime.objects \
                .filter(trip_id=trip_id) \
                .order_by('departure_time')
            
            for st in stop_times:
                if st.stop.stop_id == from_stop:
                    normalized_time = normalize_time(st.departure_time)
                    
                    if time_str <= normalized_time:
                        matching_trips.append(complete_trip)

    return matching_trips
