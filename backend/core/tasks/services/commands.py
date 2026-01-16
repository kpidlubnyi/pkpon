import logging
from functools import wraps

from django_celery_beat.models import IntervalSchedule


logger = logging.getLogger('tasks_commands')


def add_interval_arguments(func):
    @wraps(func)
    def wrapper(self, parser):
        result = func(self, parser)
        
        parser.add_argument('--every', '-e', type=int, default=15,
                            help='Interval value (default: 15)')
        
        parser.add_argument('--period', '-p', type=str,
            choices=['seconds', 'minutes', 'hours', 'days', 'weeks'],
            default='seconds',
            help='Interval period (default: seconds)'
        )
        
        return result
    return wrapper


def validate_interval(options) -> IntervalSchedule | None:
    try:
        interval_names = ['every', 'period']
        interval_args = {name: options[name] for name in interval_names}
        interval, _ = IntervalSchedule.objects.get_or_create(**interval_args)
        return interval
    
    except Exception as e:
        logger.error(f"Error creating IntervalSchedule with args: {interval_args}")
        raise