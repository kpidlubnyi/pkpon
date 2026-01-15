import polyline

from django.db.models import QuerySet

from tasks.models import *
from core.services.orr import get_polyline_between_stops


def get_coords_from_stop_times(stop_times: QuerySet[StopTime]) -> list[tuple[float, float]]:
    st_coords = []
    for st in stop_times:
        stop = st.stop
        lat, lon = stop.stop_lat, stop.stop_lon
        st_coords.append((lat, lon))

    return st_coords


def get_trip_polyline(stop_times: QuerySet[StopTime]) -> str:
    def get_polylines_from_coords(st_coords: list[tuple[float, float]]) -> list[str]:

        p_lines = []
        for start, end in zip(st_coords[:-1], st_coords[1:]):
            try:
                p_line = get_polyline_between_stops(start, end)        
            except Exception as e:
                p_line = polyline.encode([start, end])

            p_lines.append(p_line)

        return p_lines

    def merge_polylines(polylines: list[str]) -> str:
        coords = []
        for i, p in enumerate(polylines):
            part = polyline.decode(p)
            if i > 0:
                part = part[1:]
            coords.extend(part)

        return polyline.encode(coords)

    st_coords = get_coords_from_stop_times(stop_times)

    if len(st_coords) == 1:
        return polyline.encode([st_coords[0], st_coords[0]])

    polylines = get_polylines_from_coords(st_coords)
    
    return merge_polylines(polylines)


def get_complete_trip_polylines(trip_ids: list[str], sts_by_trip: dict[str, list[StopTime]]) -> list[str]:
    p_lines = []

    for i, trip_id in enumerate(trip_ids, 1):
        trip_stop_times = sts_by_trip[trip_id]
        
        trip_stop_times = (
            trip_stop_times 
            if i == len(trip_ids) 
            else trip_stop_times[:-1]
        )

        p_line = get_trip_polyline(trip_stop_times)
        p_lines.append(p_line)
    
    return p_lines
