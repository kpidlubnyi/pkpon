from trips.models import CompleteTrip


def get_trip(trip_id) -> CompleteTrip:
    return CompleteTrip.objects.get(trip_ids__contains=[trip_id])
    