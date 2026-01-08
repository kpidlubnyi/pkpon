import json
from logging import getLogger

from django.core.management.base import BaseCommand
from django_celery_beat.schedulers import PeriodicTask, IntervalSchedule



logger = getLogger('tasks_commands')


def validate_interval(options) -> IntervalSchedule | None:
    try:
        interval_names = ['every', 'period']
        interval_args = {name: options[name] for name in interval_names}
        interval, _ = IntervalSchedule.objects.get_or_create(**interval_args)
        return interval
    
    except Exception as e:
        logger.error(f"Error creating IntervalSchedule with args: {interval_args}")
        raise


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--every', '-e', type=int, default=15)
        parser.add_argument('--period', '-p', type=str,
            choices=['seconds', 'minutes', 'hours', 'days', 'weeks'],
            default='seconds',
        )

    def handle(self, *args, **options):
        schedule = validate_interval(options)
        task_name = "GTFS_UPDATING_TASK"
        task_path = 'tasks.tasks.check_gtfs_update'

        try:
            _, created = PeriodicTask.objects.get_or_create(
                interval=schedule,
                name=task_name,
                task=task_path,
                args=json.dumps(args)
            )

            if created:
                logger.info(text:=f'Periodic task {task_name} created successfully!')
                self.stdout.write(self.style.SUCCESS(text))
                return
            
            logger.warning(text:=f'Periodic task {task_name} already exists!')
            self.stdout.write(self.style.WARNING(text))
            return

        except Exception as e:
            logger.exception(text:=f'Error while creating a {task_name} periodic task: {e}')
            self.stdout.write(self.style.ERROR(text))
            return
