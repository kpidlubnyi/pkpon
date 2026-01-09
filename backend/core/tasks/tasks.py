from celery import shared_task
import logging

from core.services.redis import set_hash
from tasks.services.gtfs.download import FeedGTFS
from tasks.services.gtfs.db import (
    import_gtfs_to_staging, swap_tables, 
    backup_from_common_tables
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

            logger.info("Updating the hash...")
            set_hash(feed.sha)

        logger.info("Backing up production tables to staging...")
        backup_from_common_tables()

        logger.info("GTFS import task completed successfully")
        return {"status": "ok", "sha": feed.sha}

    except Exception as e:
        logger.exception("Error in GTFS import task: %s", e)
