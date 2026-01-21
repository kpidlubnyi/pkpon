import polyline
from functools import lru_cache

from django.db.models import QuerySet

from tasks.models import StopTime
from trips.models import CompleteTrip
from core.services.orr import get_polyline_between_stops
from core.services.redis import *


@lru_cache(4)
def get_complete_trip_stop_times(ct:CompleteTrip) -> QuerySet[StopTime]:
    return (
        StopTime.objects
        .filter(trip_id__in=ct.trip_ids)
        .select_related()
        .order_by('trip_id', 'stop_sequence')
    )
    

def get_ordered_complete_trip_st(trip_ids, ser_stop_times):
    ord_st = {trip_id: [] for trip_id in trip_ids}
    for st in ser_stop_times:
        ord_st[st['trip_id']].append(st)
    return ord_st


def get_trip_polyline(stop_times: list[dict]) -> str:
    def get_stop_coords_from_stop_times(stop_times: list[dict]) -> list[tuple[str, tuple[float, float]]]:
        st_coords = []

        for st in stop_times:
            stop = st['stop']
            lat, lon = stop['stop_lat'], stop['stop_lng']
            st_coords.append((stop['stop_id'], (lat, lon)))

        return st_coords

    def get_polylines_from_coords(st_coords: list[tuple[float, float]]) -> list[str]:
        p_lines = []

        for start_stop, end_stop in zip(st_coords[:-1], st_coords[1:]):
            start_id, start_loc = start_stop
            end_id, end_loc = end_stop

            if (cached:= get_cached_subroute(start_id, end_id)):
                p_lines.append(cached)
                continue

            try:
                p_line = get_polyline_between_stops(start_loc, end_loc)
            except Exception as e:
                logger.warning(f"Failed to create subroute polyline: {e}")
                p_line = polyline.encode([start_loc, end_loc])

            set_cached_subroute(start_id, end_id, p_line)
            p_lines.append(p_line)

        return p_lines

    def merge_polylines(polylines: list[str]) -> str:
        coords = []
        for p in polylines:
            decoded = polyline.decode(p)
            coords.extend(decoded)
            
        merged = polyline.encode(coords)
        return merged

    st_coords = get_stop_coords_from_stop_times(stop_times)
    polylines = get_polylines_from_coords(st_coords)
    merged_polyline = merge_polylines(polylines) 

    return merged_polyline


def get_complete_trip_polylines(trip_stop_times: dict[str, list[dict]]) -> list[str]:
    p_lines = []

    for trip_id, stop_times in trip_stop_times.items():
        if (cached_route := get_cached_route(trip_id)):
            return cached_route

        p_line = get_trip_polyline(stop_times)
        set_cached_route(trip_id, p_line)
        p_lines.append(p_line)

    return p_lines


def build_trip_route_name(stop_times: QuerySet[StopTime]) -> str:
    first = stop_times[0].stop.stop_name
    last = stop_times[stop_times.count() - 1].stop.stop_name
    return f'{first} - {last}'
