from logging import getLogger

from django.core.management.base import BaseCommand
from django_celery_beat.schedulers import PeriodicTask



logger = getLogger('tasks_commands')


class Command(BaseCommand):
    def handle(self, *args, **options):
        task_name = "GTFS_UPDATING_TASK"

        try:
            task = PeriodicTask.objects.get(name=task_name)
            sch = task.interval

        except:
            logger.exception(text:=f"Periodic task {task_name} doesn't exists!")
            self.stdout.write(self.style.ERROR(text))
            return
        

        try:
            task.delete()
            sch.delete()
            logger.info(text:=f'Periodic task {task_name} with its interval removed successfully!')
            
            self.stdout.write(self.style.SUCCESS(text))
        
        except Exception as e:
            logger.error(text:=f'Failed to delete {task_name} periodic task: {e}')
            self.stdout.write(self.style.ERROR(text))
            return
    
        