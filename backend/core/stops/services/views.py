from datetime import date, time 

from django.utils import timezone as tz

from tasks.models import *
from trips.models import CompleteTrip
from trips.services.serializers import build_trip_stop_times


def get_all_stops():
    return Stop.objects.all().order_by('stop_name')


def get_stop(stop_id):
    return Stop.objects.get(stop_id=stop_id)


def get_real_stop_times_datetimes(stop_times: QuerySet[StopTime]) -> list[dict]:
    def get_real_datetime(st: dict) -> tuple[str, str, str]:
        def normalize_time(time_str: str) -> str:
            h, m, s = map(int, time_str.split(':'))
            while h > 23:
                h -= 24
            return f'{h:02d}:{m:02d}:{s:02d}'

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

    return real_stop_times


def get_stop_schedule(stop_id:str, direction:str, date_:date, time_:time) -> QuerySet[StopTime] :
    stop_times = StopTime.objects \
        .filter(stop__stop_id=stop_id) \
        .values('id', 'arrival_time', 'departure_time', 'trip_id')
    
    st_real_datetimes = get_real_stop_times_datetimes(stop_times)
    needed_time = 'departure_time' if direction == 'departures' else 'arrival_time' 
    date_str = date_.strftime('%Y-%m-%d')
    time_str = time_.strftime('%H:%M:%S')

    filtered_stop_times_trip_ids = [
        (st['id'], st['trip_id']) for st in st_real_datetimes
        if st['date'] == date_str and st[needed_time] >= time_str
    ]

    filtered_stop_time_ids = [] 
    pos = 0 if direction == 'arrivals' else -1
    
    for st_id, trip_id in filtered_stop_times_trip_ids:
        complete_trip = CompleteTrip.objects.get(trip_ids__contains=[trip_id])
        ct_stop_times = build_trip_stop_times(complete_trip)
        
        if ct_stop_times[pos].stop.stop_id != stop_id:
            filtered_stop_time_ids.append(st_id)

    schedule = StopTime \
        .objects \
        .filter(pk__in=filtered_stop_time_ids) \
        .order_by(needed_time)
    
    return schedule
