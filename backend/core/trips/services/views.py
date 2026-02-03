from datetime import date, time

from core.services.redis import (
    get_cached_trip, set_cached_trip,
    get_cached_user_trip_ids_search,
    set_cached_user_trip_ids_search
)
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


def find_matching_trips(from_stop:str, to_stop:str, date_:date, time_:time) -> dict:
    def trip_matches_by_stops(trip_stops: list[str], searching_for: tuple[str, str]) -> bool:
        i = 0
        
        for stop in trip_stops:
            if stop == searching_for[i]:
                if i == 1:
                    return True
                i += 1

        return False  
    
    date_str = date_.strftime('%Y-%m-%d')
    time_str = time_.strftime('%H:%M:%S')

    if (cached:= get_cached_user_trip_ids_search(from_stop, to_stop, date_str, time_str)):
        matching_trips = CompleteTrip.objects.filter(id__in=cached)
        return matching_trips
    
    trips_stops_matching_by_date = CompleteTrip.objects.filter(trip_ids__0__startswith=date_str)
    
    trips_matching_by_stops = [
        trip
        for trip in trips_stops_matching_by_date
        if trip_matches_by_stops(trip.stops, (from_stop, to_stop)) 
    ]
    
    matching_trips = []
    last_not_matching_time = None  # | both for calculating cached user trip time to expire
    first_matching_time = None     # |
       
    for complete_trip in trips_matching_by_stops:
        for trip_id in complete_trip.trip_ids:
            stop_times = StopTime.objects \
                .filter(trip_id=trip_id) \
                .order_by('departure_time')
            
            for st in stop_times:
                if st.stop.stop_id != from_stop:
                    continue

                dep_time = st.departure_time
                
                if time_str <= dep_time:
                    matching_trips.append(complete_trip)
                    
                    first_matching_time = (
                        dep_time
                        if first_matching_time is None
                        else min(first_matching_time, dep_time)
                    )
                else:
                    last_not_matching_time = (
                        dep_time
                        if last_not_matching_time is None
                        else max(last_not_matching_time, dep_time)
                    )

    if matching_trips:
        if last_not_matching_time:
            from_time_str = last_not_matching_time
        else:
            from_time_str = time_str

        to_time_str = first_matching_time

        mt_ids = [tr.id for tr in matching_trips]

        try:
            set_cached_user_trip_ids_search(
                from_stop, to_stop, date_str, 
                from_time_str, to_time_str, mt_ids
            )
        except:
            pass

    return matching_trips
