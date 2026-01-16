import json
from logging import getLogger

from django.core.management.base import BaseCommand
from django_celery_beat.schedulers import PeriodicTask

from tasks.services.commands import validate_interval, add_interval_arguments


logger = getLogger('tasks_commands')


class Command(BaseCommand):
    @add_interval_arguments
    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        schedule = validate_interval(options)
        task_name = "ORR_MAP_UPDATING_TASK"
        task_path = 'tasks.tasks.update_orr_map'

        try:
            _, created = PeriodicTask.objects.get_or_create(
                interval=schedule,
                name=task_name,
                task=task_path,
                args=json.dumps(args)
            )

            if created:
                logger.info(text:=f'Periodic task {task_name} created successfully (interval: {schedule.every} {schedule.period})!')
                self.stdout.write(self.style.SUCCESS(text))
                return
            
            logger.warning(text:=f'Periodic task {task_name} already exists!')
            self.stdout.write(self.style.WARNING(text))
            return

        except Exception as e:
            logger.exception(text:=f'Error while creating a {task_name} periodic task: {e}')
            self.stdout.write(self.style.ERROR(text))
            return
