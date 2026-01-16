from django.core.management.base import BaseCommand
from tasks.tasks import check_gtfs_update, update_orr_map

class Command(BaseCommand):
    def handle(self, *args, **options):
        check_gtfs_update.delay()
        update_orr_map.delay()

        self.stdout.write(self.style.SUCCESS("Initial tasks ran successfully!"))
