from celery import shared_task
from time import sleep
import requests
import logging
import os

from django.conf import settings
from django.db.models import Count

from core.services.redis import set_hash, truncate_gtfs_related_cached_data
from stops.services.views import get_isochrone_map
from tasks.models import StopTime
from tasks.services.gtfs.download import FeedGTFS
from tasks.services.gtfs.db import (
    backup_from_common_tables, recreate_data_in_complete_trips,
    import_gtfs_to_staging, swap_tables
)

logger = logging.getLogger(__name__)


@shared_task()
def check_gtfs_update():
    try:
        feed = FeedGTFS()

        if not feed.has_been_updated:
            logger.info('The feed hasn\'t been updated. Finishing the task...')
            return "No new feed"

        try:
            logger.info("Downloading GTFS...")
            zip_file = feed.download_gtfs()

            logger.info("Importing GTFS to staging tables...")
            import_gtfs_to_staging(zip_file, batch_size=200_000)

        except Exception as e:
            logger.error(f'Error during importing new data to staging tables: {e}')
            backup_from_common_tables()
            logger.info("Backed up after the error")
            return {"status": "error", "e" :e}
        
        else:
            logger.info("Swapping staging and production tables...")
            swap_tables()

            logger.info("Recreating data in the CompleteTrips unlogged table...")
            recreate_data_in_complete_trips()

            logger.info("Deleting GTFS related cached data...")
            deleted = truncate_gtfs_related_cached_data()

            logger.info(f"Deleted {deleted} cached records. Updating the hash...")
            set_hash(feed.sha)

        logger.info("Backing up production tables to staging...")
        backup_from_common_tables()

        logger.info("GTFS import task completed successfully. Calling the isochrone creating task...")
        create_isochrone_cache.delay()
        return {"status": "ok", "sha": feed.sha}

    except Exception as e:
        logger.exception("Error in GTFS import task: %s", e)


@shared_task
def update_orr_map():
    try:
        path = settings.BASE_DIR / 'flags'
        os.makedirs(path, exist_ok=True)
        
        NEW_MAP_FLAG_FILE = settings.ORR_NEW_MAP_FLAG_FILE
        flag_path = path / NEW_MAP_FLAG_FILE
        
        with open(flag_path, 'w'):
            pass
        
        return {'created': True, 'path':flag_path}
    except Exception as e:
        return {'created': False, 'error': e}


@shared_task
def create_isochrone_cache():
    logger.info('Creating isochrone cache...')
    created_layers = 0
    qs = (
        StopTime.objects
        .values('stop__stop_id', 'stop__stop_name')
        .annotate(trip_id=Count('trip_id'))
        .order_by('-trip_id')
    )

    limits = [
        (5,   5),
        (20,  4),
        (100, 3),
        (250, 2),
    ]

    healthcheck_url = f'{settings.ORR_URL}/health'
    for attempt in range(1, 61):
        try:
            requests.get(healthcheck_url, timeout=5).raise_for_status()
            break
        except requests.RequestException as e:
            logger.warning(
                f"ORR Healthcheck failed (attempt {attempt}/60): {e}"
            )
            sleep(5)
    else:
        raise RuntimeError("ORR service is not healthy after max retries")


    for i, el in enumerate(qs.iterator(), start=1):
        stop_id = el['stop__stop_id']
        for limit, level in limits:
            if i <= limit:
                _ = get_isochrone_map(stop_id, level)
                created_layers += 1
                break

        logger.info(f"Created isochrone cache for the stop with id '{stop_id}' with {level} priority level.")
    
    return {'status': 'ok', 'created_layers': created_layers}
