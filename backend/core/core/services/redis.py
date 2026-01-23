import redis
import json
import uuid
from datetime import datetime
from logging import getLogger
from typing import Any, Callable

from django.conf import settings
from django.utils import timezone as tz


logger = getLogger('core_services')

try:
    redis_pool = redis.ConnectionPool.from_url(
        settings.REDIS,
        decode_responses=True,
        max_connections=64,
        retry_on_timeout=True,
        socket_keepalive=True,
        socket_keepalive_options={},
        socket_connect_timeout=5,    
        socket_timeout=5,          
        health_check_interval=30    
    )
    
    redis_client = redis.Redis(connection_pool=redis_pool)
    redis_client.ping()
    
except Exception as e:
    redis_client = None
    redis_pool = None


def redis_operation(func):
    def wrapper(*args, **kwargs):
        if redis_client is None:
            return None
            
        try:
            return func(*args, **kwargs)
        except redis.ConnectionError as e:
            return None
        except redis.TimeoutError as e:
            return None
        except Exception as e:
            raise Exception(e)
    return wrapper


@redis_operation
def set_hash(val:str):
    return redis_client.set(settings.PKP_HASH_KEY, val)


@redis_operation
def get_hash():
    _hash = redis_client.get(settings.PKP_HASH_KEY) 
    
    if _hash:
        return _hash
    else:
        set_hash('init')
        return get_hash()


@redis_operation
def create_session(user) -> str | None:
    session_id = str(uuid.uuid4())
    session_data = {
        'user_id': str(user.user_id),
        'email': user.email,
        'created_at': tz.localtime().isoformat(),
    }
    
    try:
        redis_client.setex(
            f"session:{session_id}", 
            6*60*60, # 6 hours
            json.dumps(session_data, ensure_ascii=False)
        )
        return session_id
    
    except Exception as e:
        logger.error(f"Error while creating an session in redis: {e}")
        raise        


@redis_operation
def get_session(session_id: str) -> dict | None:
    if not session_id:
        return None
    
    session_data = redis_client.get(f"session:{session_id}")
    
    if session_data:
        try:
            return json.loads(session_data)
        except json.JSONDecodeError as e:
            raise
    return None


@redis_operation
def delete_session(session_id: str) -> bool:
    result = redis_client.delete(f"session:{session_id}")
    return result


@redis_operation
def set_cached(prefix: str, key: str, value: dict | str, *, is_json: bool = False, ex: int | None = None) -> int:
    key = f'{prefix}:{key}'
    value = json.dumps(value) if is_json else value
    return redis_client.set(key, value, ex=ex)


def set_cached_with_time_range(
    namespace:str, pattern:str, key:str, 
    to_time:str, data:Any, ex:int, *, split_max:int,
) -> int:
    for k in redis_client.scan_iter(match=pattern):
        *_, tr = k.split(':', maxsplit=split_max)
        _, k_to_time = tr.split('-', 1)

        if k_to_time == to_time:
            redis_client.delete(k)
            break

    return set_cached(namespace, key, data, is_json=True, ex=ex)


def set_cached_trip(trip_id:str, trip_data:dict[str, Any]):
    return set_cached('trip', trip_id, trip_data, is_json=True)

def set_cached_subroute(start_id:str, end_id:str, value:str) -> int:
    key = f'{start_id}-{end_id}'
    return set_cached('subroute', key, value)

def set_cached_route(trip_id:str, value:str) -> int:
    return set_cached('route', trip_id, value)

def set_cached_stop_real_stop_times(stop_id:str, data:list[dict]) -> int:
    return set_cached('real_stop_times', stop_id, data, is_json=True)

def set_cached_stop_isochrone(stop_id:str, hours:int, data:list[str]):
    key = f'{stop_id}:{hours}'
    return set_cached('isochrone', key, data, is_json=True)

def calculate_time_range(from_t: str, to_t: str) -> int:
    fmt = "%H:%M:%S"
    start = datetime.strptime(from_t, fmt)
    end = datetime.strptime(to_t, fmt)
    delta = (end - start).total_seconds()
    return max(0, int(delta))

def set_cached_stop_schedule(
    stop_id: str, direction: str, date_: str,
    from_time: str, to_time: str, data: list[dict],
) -> int:
    key = f'{stop_id}:{direction}:{date_}:{from_time}-{to_time}'
    ex = calculate_time_range(from_time, to_time)
    pattern = f'schedule:{stop_id}:{direction}:{date_}:*'

    return set_cached_with_time_range(
        'schedule', pattern, key,
        to_time, data, ex, split_max=4
    )

def set_cached_user_trip_ids_search(
    from_stop: str, to_stop: str, date: str,
    from_time: str, to_time: str, data: list[str],
) -> int:
    key = f'{from_stop}-{to_stop}:{date}:{from_time}-{to_time}'
    ex = calculate_time_range(from_time, to_time)
    pattern = f'user_trip:{from_stop}-{to_stop}:{date}:*'

    return set_cached_with_time_range(
        'user_trip', pattern, key,
        to_time, data, ex, split_max=3
    )


@redis_operation
def get_cached(prefix: str, key: str, *, is_json: bool = False) -> dict | str | None:
    key = f'{prefix}:{key}'
    value = redis_client.get(key)
    if not value:
        return None
    return json.loads(value) if is_json else value

def get_cached_by_time_range(pattern:str, time_:str, parse_key:Callable) -> list | None:
    def build_cache_key(parts: list[str]) -> str:
        return ':'.join(parts)
    
    for key in redis_client.scan_iter(match=pattern):
        parsed = parse_key(key)

        prfx, time_range, key_parts = parsed
        time_from, time_to = time_range.split('-', 1)

        if time_from <= time_ <= time_to:
            cache_key = build_cache_key(key_parts)
            return get_cached(prfx, cache_key, is_json=True)

    return None

def get_cached_trip(trip_id: str) -> dict | None:
    return get_cached('trip', trip_id, is_json=True)

def get_cached_subroute(start_id:str, end_id:str) -> str | None:
    key = f'{start_id}-{end_id}'
    return get_cached('subroute', key)

def get_cached_route(trip_id:str) -> str | None:
    return get_cached('route', trip_id)

def get_cached_stop_real_stop_times(stop_id:str) -> list[dict[str, Any]] | None:
    return get_cached('real_stop_times', stop_id, is_json=True)

def get_cached_stop_isochrone(stop_id:str, hours:int) -> list[str] | None:
    key = f'{stop_id}:{hours}'
    return get_cached('isochrone', key, is_json=True)

def get_cached_stop_schedule(stop_id: str, direction: str, date_: str, time_: str) -> list[dict] | None:
    pattern = f'schedule:{stop_id}:{direction}:{date_}:*'

    def parse_key(key:str):
        prfx, st, dr, d, tr = key.split(':', 4)
        return prfx, tr, (st, dr, d, tr)
    
    return get_cached_by_time_range(pattern, time_, parse_key)

def get_cached_user_trip_ids_search(from_stop_id:str, to_stop_id:str, date_:str, time_:str) -> list[str] | None:
    pattern = f'user_trip:{from_stop_id}-{to_stop_id}:{date_}:*'

    def parse_key(key:str):
        prfx, fr_to_s, d, tr = key.split(':', maxsplit=3)
        return prfx, tr, (fr_to_s, d, tr)
    
    return get_cached_by_time_range(pattern, time_, parse_key)

@redis_operation
def truncate_cached(pattern:str) -> int:
    deleted_count = 0
    cursor = 0

    while True:
        cursor, keys = redis_client.scan(cursor=cursor, match=pattern, count=1000)

        if keys:
            redis_client.delete(*keys)
            deleted_count += len(keys)

        if cursor == 0:
            break

    return deleted_count


def truncate_cached_trips() -> int:
    return truncate_cached('trip:*')
    
def truncate_cached_subroutes() -> int:
    return truncate_cached('subroute:*')

def truncate_cached_routes() -> int:
    return truncate_cached('route:*')

def truncate_cached_stop_real_stop_times() -> int:
    return truncate_cached('real_stop_times:*')

def truncate_cached_schedules() -> int:
    return truncate_cached('schedule:*')

def truncate_cached_user_trips() -> int:
    return truncate_cached('user_trip:*')

def truncate_cached_stop_isochrones() -> int:
    return truncate_cached('isochrone:*')

def truncate_gtfs_related_cached_data() -> int:
    return truncate_cached_trips() \
        + truncate_cached_routes() \
        + truncate_cached_stop_real_stop_times() \
        + truncate_cached_schedules() \
        + truncate_cached_user_trips() \
        + truncate_cached_stop_isochrones()

def truncate_map_related_cached_data() -> int:
    return truncate_cached_routes()
