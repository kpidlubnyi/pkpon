from celery import shared_task
from logging import getLogger

from django.conf import settings


logger = getLogger(__name__)

@shared_task
def test_task():
    logger.info("Hello, World!")
