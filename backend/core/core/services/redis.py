import redis
import json
import uuid
from logging import getLogger

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
        'created_at': tz.now().isoformat(),
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
