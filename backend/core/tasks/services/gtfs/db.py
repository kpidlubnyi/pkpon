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


def recreate_data_in_final_trips():
    CompleteTrip.objects.all().delete()

    processed_trip_ids = set()
    final_trips = []

    for start_trip in Trip.objects.all().order_by("trip_id"):
        if start_trip.trip_id in processed_trip_ids:
            continue

        envolved_trip_ids = []
        current_trip = start_trip

        while True:
            if current_trip.trip_id in processed_trip_ids:
                break

            processed_trip_ids.add(current_trip.trip_id)
            envolved_trip_ids.append(current_trip.trip_id)

            transfer = (
                Transfer.objects
                .filter(from_trip=current_trip)
                .select_related("to_trip")
                .first()
            )

            if not transfer:
                break

            current_trip = transfer.to_trip

        final_trips.append(
            CompleteTrip(trip_ids=envolved_trip_ids)
        )

    CompleteTrip.objects.bulk_create(final_trips)
