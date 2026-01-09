import io
import csv

from zipfile import ZipFile
from typing import Generator, List

from django.db.models import Model

from tasks.models import *



GTFS_MODELS_ST = {
    'calendar': CalendarStaging,
    'routes': RouteStaging,
    'stops': StopStaging,
    'trips': TripStaging,
    'stop_times': StopTimeStaging,
    'transfers': TranferStaging, 
}


def iter_zip_csv_batches(
    zip_file: ZipFile,
    filename: str,
    batch_size: int = 100_000,
) -> Generator[List[dict], None, None]:
    try:
        target_file = None
        for info in zip_file.infolist():
            name, ext = info.filename.split('.')
            if name == filename and ext in {'csv', 'txt'}:
                target_file = info
                break

        if not target_file:
            return

        with zip_file.open(target_file) as raw:
            text = io.TextIOWrapper(raw, encoding='utf-8-sig', newline='')
            reader = csv.DictReader(text)

            batch = []
            for row in reader:
                batch.append(row)

                if len(batch) >= batch_size:
                    yield batch
                    batch = []

            if batch:
                yield batch

    except Exception as e:
        raise

def convert_to_orm_obj(model:Model, batch_data:list[dict]) -> list:
    allowed_fields = [field.attname for field in model._meta.fields]
    records = []

    for row in batch_data:
        filtered = {
            k: (None if v in {'', None} else v)
            for k, v in row.items()
            if k in allowed_fields
        }

        if model == CalendarStaging:
            weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            filtered['weekdays_availability'] = [int(row[day]) for day in weekdays]

        try:
            records.append(model(**filtered))
        except Exception as e:
            raise

    return records
