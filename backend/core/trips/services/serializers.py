import polyline

from django.db.models import QuerySet

from tasks.models import StopTime
from core.services.orr import get_polyline_between_stops
from core.services.redis import *


def get_trip_polyline(stop_times: QuerySet[StopTime]) -> str:
    def get_stop_coords_from_stop_times(stop_times: QuerySet[StopTime]) -> list[tuple[str, tuple[float, float]]]:
        st_coords = []

        for st in stop_times:
            stop = st.stop
            lat, lon = stop.stop_lat, stop.stop_lon
            st_coords.append((stop.stop_id, (lat, lon)))

        return st_coords

    def get_polylines_from_coords(st_coords: list[tuple[float, float]]) -> list[str]:
        p_lines = []

        for start_stop, end_stop in zip(st_coords[:-1], st_coords[1:]):
            start_id, start_loc = start_stop
            end_id, end_loc = end_stop

            cached_subroute = get_cached_subroute(start_id, end_id)
            if cached_subroute:
                p_lines.append(cached_subroute)
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
        for i, p in enumerate(polylines):
            if not p:
                continue
            try:
                part = polyline.decode(p)
            except Exception as e:
                continue

            if i > 0 and len(part) > 1:
                part = part[1:]
            coords.extend(part)

        if not coords:
            return polyline.encode([(0.0, 0.0)])

        merged = polyline.encode(coords)
        return merged

    st_coords = get_stop_coords_from_stop_times(stop_times)

    if len(st_coords) == 1:
        return polyline.encode([st_coords[0][1], st_coords[0][1]])

    polylines = get_polylines_from_coords(st_coords)
    return merge_polylines(polylines)


def get_complete_trip_polylines(trip_ids: list[str], sts_by_trip: dict[str, list[StopTime]]) -> list[str]:
    p_lines = []

    for i, trip_id in enumerate(trip_ids, 1):
        cached_route = get_cached_route(trip_id)
        if cached_route:
            return cached_route

        trip_stop_times = sts_by_trip[trip_id]

        trip_stop_times = trip_stop_times if i == len(trip_ids) else trip_stop_times[:-1]

        p_line = get_trip_polyline(trip_stop_times)
        set_cached_route(trip_id, p_line)
        p_lines.append(p_line)

    return p_lines
