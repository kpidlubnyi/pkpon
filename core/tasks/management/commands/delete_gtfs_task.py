from logging import getLogger

from django.core.management.base import BaseCommand
from django_celery_beat.schedulers import PeriodicTask



logger = getLogger('tasks_commands')


class Command(BaseCommand):
    def handle(self, *args, **options):
        task_name = "GTFS_UPDATING_TASK"

        try:
            task = PeriodicTask.objects.get(name=task_name)

        except:
            logger.exception(text:=f"Periodic task {task_name} doesn't exists!")
            self.stdout.write(self.style.ERROR(text))
            return
        
        deleted = task.delete()

        if deleted:
            logger.info(text:=f'Periodic task {task_name} removed successfully!')
            self.stdout.write(self.style.SUCCESS(text))
            return
        else:
            logger.error(text:=f'Failed to delete {task_name} periodic task!')
            self.stdout.write(self.style.ERROR(text))
            return
    
        