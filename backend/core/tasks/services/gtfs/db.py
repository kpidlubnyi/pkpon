from collections import defaultdict

from django.db import transaction, connection

from trips.models import CompleteTrip
from .process import *


def get_table_name(model: Model):
    return model._meta.db_table

def truncate_gtfs_staging_tables():
    try:
        with transaction.atomic():
            for model in GTFS_MODELS_ST.values():
                model.objects.all().delete()
    
    except Exception as e:
        raise


def import_to_staging(orm_objs, model):
    try:
        with transaction.atomic():
            model.objects.bulk_create(orm_objs)
    except Exception as e:
        raise


def swap_tables():    
    def rename_table(old:str, new:str) -> str:
        return f'ALTER TABLE "{old}" RENAME TO "{new}";'
    
    with transaction.atomic():
        for model_st in GTFS_MODELS_ST.values():
            model_name = get_table_name(model_st._base_model)
            model_name_st = get_table_name(model_st)
            model_name_old = model_name + '_OLD'

            with connection.cursor() as cursor:
                cursor.execute(rename_table(model_name, model_name_old))
                cursor.execute(rename_table(model_name_st, model_name))
                cursor.execute(rename_table(model_name_old, model_name_st))


def import_gtfs_to_staging(zip_file: ZipFile, batch_size: int = 200_000):
    truncate_gtfs_staging_tables()
    
    for filename, model in GTFS_MODELS_ST.items():
        for batch in iter_zip_csv_batches(zip_file, filename, batch_size):
            orm_objs = convert_to_orm_obj(model, batch)
            import_to_staging(orm_objs, model)


def backup_from_common_tables():
    truncate_gtfs_staging_tables()
    st_models = list(GTFS_MODELS_ST.values())
    
    with transaction.atomic():
        with connection.cursor() as cursor:
            for st_model in st_models:
                model = st_model._base_model
                model_name = get_table_name(model)
                model_staging_name = get_table_name(st_model)

                if model.objects.count() > 0:
                    cursor.execute(f'INSERT INTO "{model_staging_name}" SELECT * FROM "{model_name}";')
                
                    if hasattr(model, 'id'):
                        cursor.execute(f'SELECT MAX(id) FROM "{model_staging_name}"')
                        max_id = cursor.fetchone()[0]
                        
                        if max_id is not None:
                            sequence_name_staging = f'"{model_staging_name}_id_seq"'
                            sequence_name = f'"{model_name}_id_seq"'
                            
                            cursor.execute(f"SELECT setval('{sequence_name}', {max_id+1});")
                            cursor.execute(f"SELECT setval('{sequence_name_staging}', {max_id+1});")


def recreate_data_in_complete_trips():
    CompleteTrip.objects.all().delete()

    transfers = {
        tr.from_trip_id: tr.to_trip_id
        for tr in Transfer.objects.all()
    }

    trip_ids = list(
        Trip.objects.all()
        .order_by('trip_id')
        .values_list('trip_id', flat=True)
    )

    stop_times = ( 
        StopTime.objects.all() 
        .order_by('trip', 'stop_sequence')
        .values_list('trip__trip_id', 'stop__stop_id')
    )

    stops_by_trip = defaultdict(list)
    for trip_id, stop_id in stop_times:
        stops_by_trip[trip_id].append(stop_id)

    processed = set()
    grouped_trip_ids = []

    for start_trip_id in trip_ids:
        if start_trip_id in processed:
            continue

        involved = []
        current = start_trip_id

        while current and current not in processed:
            processed.add(current)
            involved.append(current)
            current = transfers.get(current)

        complete_stops = []
        for trip_id in involved:
            complete_stops.extend(stops_by_trip.get(trip_id, []))

        grouped_trip_ids.append(
            CompleteTrip(
                trip_ids=involved,
                stops=complete_stops,
            )
        )
    
    CompleteTrip.objects.bulk_create(grouped_trip_ids)
