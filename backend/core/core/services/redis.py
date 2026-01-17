import redis
import json
import uuid
from logging import getLogger
from typing import Any

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
def set_cached(prefix: str, key: str, value: dict | str, *, is_json: bool = False) -> int:
    key = f'{prefix}:{key}'
    value = json.dumps(value) if is_json else value
    return redis_client.set(key, value)


def set_cached_trip(trip_id:str, trip_data:dict[str, Any]):
    return set_cached('trip', trip_id, trip_data, is_json=True)

def set_cached_subroute(start_id:str, end_id:str, value:str) -> int:
    key = f'{start_id}-{end_id}'
    return set_cached('subroute', key, value)

def set_cached_route(trip_id:str, value:str) -> int:
    return set_cached('route', trip_id, value)


@redis_operation
def get_cached(prefix: str, key: str, *, is_json: bool = False) -> dict | str | None:
    key = f'{prefix}:{key}'
    value = redis_client.get(key)
    if not value:
        return None
    return json.loads(value) if is_json else value


def get_cached_trip(trip_id: str) -> dict | None:
    return get_cached('trip', trip_id, is_json=True)

def get_cached_subroute(start_id:str, end_id:str) -> str | None:
    key = f'{start_id}-{end_id}'
    return get_cached('subroute', key)

def get_cached_route(trip_id:str) -> str | None:
    return get_cached('route', trip_id)


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

def truncate_gtfs_related_cached_data() -> int:
    return truncate_cached_trips() + truncate_cached_routes()

def truncate_map_related_cached_data() -> int:
    return truncate_cached_routes()