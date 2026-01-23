from datetime import date, time 
from typing import NamedTuple
from math import sqrt
from shapely import Point, Polygon

from django.utils import timezone as tz

from tasks.models import QuerySet, Stop, StopTime 
from trips.models import CompleteTrip
from core.services.orr import get_isochrone_polygone
from core.services.redis import (
    get_cached_stop_real_stop_times,
    get_cached_stop_schedule,
    set_cached_stop_real_stop_times,
    set_cached_stop_schedule,
)



def get_all_stops():
    return Stop.objects.all().order_by('stop_name')


def get_stop(stop_id):
    return Stop.objects.get(stop_id=stop_id)


def normalize_time(time_str: str) -> str:
    h, m, s = map(int, time_str.split(':'))
    while h > 23:
        h -= 24
    return f'{h:02d}:{m:02d}:{s:02d}'


def get_real_stop_times_datetimes(stop_times: QuerySet[StopTime]) -> list[dict]:
    def get_real_datetime(st: dict) -> tuple[str, str, str]:
        trip_id = st['trip_id']
        date_str = trip_id.split('_')[0]
        date_ = tz.datetime.strptime(date_str, '%Y-%m-%d')

        arr_time = st['arrival_time']
        dep_time = st['departure_time']
        real_arr_time = normalize_time(arr_time)
        real_dep_time = normalize_time(dep_time)

        if real_arr_time != arr_time or real_dep_time != dep_time:
            date_ += tz.timedelta(days=1)

        real_date = date_.strftime('%Y-%m-%d')

        return real_date, real_arr_time, real_dep_time
    
    stop_id = stop_times[0]['stop_id']
    if (cached:= get_cached_stop_real_stop_times(stop_id)):
        return cached
    
    real_stop_times = []
    for st in stop_times:
        real_date, real_arr_time, real_dep_time = get_real_datetime(st)
        real_stop_times.append({
            'id': st['id'],
            'trip_id': st['trip_id'],
            'arrival_time':  real_arr_time,
            'departure_time': real_dep_time,
            'date': real_date,
        })

    set_cached_stop_real_stop_times(stop_id, real_stop_times)
    return real_stop_times


class ScheduleStopTimeNT(NamedTuple):
    id_: int
    trip_id: str
    time_: str


def get_stop_schedule_stop_time_ids(stop_id:str, direction:str, date_:date, time_:time) -> list[int]:
    date_str = date_.strftime('%Y-%m-%d')
    time_str = time_.strftime('%H:%M:%S')
    
    if (cached := get_cached_stop_schedule(stop_id, direction, date_str, time_str)):
        return cached
    
    stop_times = StopTime.objects \
        .filter(stop__stop_id=stop_id) \
        .values('id', 'arrival_time', 'departure_time', 'trip_id', 'stop_id')
    
    st_real_datetimes = get_real_stop_times_datetimes(stop_times)
    needed_time = 'departure_time' if direction == 'departures' else 'arrival_time'
     
    prev_st = ScheduleStopTimeNT(None, None, '00:00:00')   # for calculating time range of the schedule relevance and future caching
    sts_filtered_by_datetime = []
    
    for st in st_real_datetimes:
        if st['date'] == date_str:
            if st[needed_time] >= time_str:
                t = ScheduleStopTimeNT(st['id'], st['trip_id'], st[needed_time])
                sts_filtered_by_datetime.append(t)
            else:
                if st[needed_time] > prev_st.time_:
                    prev_st = ScheduleStopTimeNT(st['id'], st['trip_id'], st[needed_time])
    
    if (prev_exists := bool(prev_st.id_)):
        sts_filtered_by_datetime.insert(0, prev_st)

    sts_filtered_by_stop_sq = [] 
    pos = 0 if direction == 'arrivals' else -1
    
    for st in sts_filtered_by_datetime:
        ct_stops = CompleteTrip.objects \
            .get(trip_ids__contains=[st.trip_id]) \
            .stops
        
        if ct_stops[pos] != stop_id:
            sts_filtered_by_stop_sq.append(st)

    prev_in_schedule = any(prev_st.id_ == st.id_ for st in sts_filtered_by_stop_sq)

    if not (prev_exists and prev_in_schedule):
        start_time = time_str
    else:
        sts_filtered_by_stop_sq.pop(0)
        start_time = prev_st.time_

    stop_time_ids = [st.id_ for st in sts_filtered_by_stop_sq]

    if stop_time_ids:
        end_time = sts_filtered_by_stop_sq[0].time_
        end_time = normalize_time(end_time)

        set_cached_stop_schedule(
            stop_id, direction, date_str, 
            start_time, end_time, stop_time_ids,
        )

    return stop_time_ids


def get_stop_schedule(stop_id:str, direction:str, date_:date, time_:time) -> QuerySet[StopTime]:
    needed_time = 'departure_time' if direction == 'departures' else 'arrival_time'
    stop_time_ids = get_stop_schedule_stop_time_ids(stop_id, needed_time, date_, time_)
        
    schedule = StopTime.objects \
        .filter(pk__in=stop_time_ids) \
        .order_by(needed_time)

    return schedule





def simplify_polygon(points: list[list[float]]) -> list[list[float]]:
    def rdp(points, eps):
        def get_perp_dist(point, start, end):
            if start == end:
                return sqrt((point[0] - start[0])**2 + (point[1] - start[1])**2)
            else:
                x0, y0 = point
                x1, y1 = start
                x2, y2 = end
                num = abs((y2 - y1)*x0 - (x2 - x1)*y0 + x2*y1 - y2*x1)
                den = sqrt((y2 - y1)**2 + (x2 - x1)**2)
                return num / den
    
        if len(points) < 3:
            return points
            
        max_dist = 0.0
        index = 0
        for i in range(1, len(points) - 1):
            dist = get_perp_dist(points[i], points[0], points[-1])
            if dist > max_dist:
                max_dist = dist
                index = i

        if max_dist > eps:
            left = rdp(points[:index+1], eps)
            right = rdp(points[index:], eps)
            return left[:-1] + right
        else:
            return [points[0], points[-1]]

    xs, ys = zip(*points)
    max_dist = max(max(xs) - min(xs), max(ys) - min(ys))
    epsilon = max_dist / 100

    return rdp(points, epsilon)


def get_isochrone_map(stop_id: str, hours: int):
    stops_qs = list(
        Stop.objects
        .values('stop_id', 'stop_lat', 'stop_lon')
    )

    stop = next(s for s in stops_qs if s['stop_id'] == stop_id)
    stop_loc = (stop['stop_lat'], stop['stop_lon'])

    layers = dict()
    already_in = set()

    stop_points = {
        s['stop_id']: Point(s['stop_lon'], s['stop_lat'])
        for s in stops_qs
    }

    for i in range(1, hours + 1):
        area = get_isochrone_polygone(stop_loc, i)
        area = simplify_polygon(area)

        polygon = Polygon(area)

        stops_in_area = {
            stop_id
            for stop_id, point in stop_points.items()
            if polygon.covers(point)
        }

        new_ones = stops_in_area - already_in
        layers[hours - i] = list(new_ones)
        already_in.update(new_ones)

    return layers
