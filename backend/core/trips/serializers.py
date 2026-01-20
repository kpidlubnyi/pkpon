from collections import Counter

from rest_framework.serializers import ModelSerializer, SerializerMethodField
from stops.serializers import PolylineStopTimeSerializer, StopTimeSerializer
from tasks.models import Route, Trip, Transfer
from trips.models import CompleteTrip
from trips.services.serializers import *


class BaseRouteSerializers(ModelSerializer):
    class Meta:
        model = Route
        fields = (
            'route_id',
            'route_short_name',
            'route_long_name',
            'route_type',
        )

class BaseTransferSerializer(ModelSerializer):
    class Meta:
        model = Transfer
        fields = (
            'transfer_type',
            'from_trip_id',
            'to_trip_id',
        )

class BaseCompleteTripSerializer(ModelSerializer):
    trip_short_name = SerializerMethodField()
    trip_route_name = SerializerMethodField()
    trip_headsign = SerializerMethodField()
    routes = SerializerMethodField()
    legs = SerializerMethodField()
    transfers = SerializerMethodField()
    plk_train_number = SerializerMethodField()
    carriages = SerializerMethodField()
    polylines = SerializerMethodField()
    trip_stop_times = SerializerMethodField()

    def _trips(self, obj:CompleteTrip) -> list[dict]:
        if not hasattr(self, '_trips_cache'):
            self._trips_cache = list(
                Trip.objects
                .filter(trip_id__in=obj.trip_ids)
                .values(
                    'trip_id',
                    'trip_short_name',
                    'trip_headsign',
                    'route_id',
                    'plk_train_number',
                    'carriages',
                )
            )
        return self._trips_cache
    
    def _values(self, obj:CompleteTrip, key:str) -> list[Any]:
        return [trip.get(key, None) for trip in self._trips(obj)]

    def _most_common(self, obj:CompleteTrip, key:str) -> Any:
        values = self._values(obj, key)
        if not values:
            return None
        return Counter(values).most_common(1)[0][0]

    def get_legs(self, obj:CompleteTrip) -> int:
        return len(self._trips(obj))
    
    def get_trip_headsign(self, obj:CompleteTrip) -> str | None:
        return self._most_common(obj, 'trip_headsign')

    def get_trip_short_name(self, obj:CompleteTrip) -> str | None:
        return self._most_common(obj, 'trip_short_name')
    
    def get_trip_route_name(self, obj:CompleteTrip) -> str:
        stop_times = get_complete_trip_stop_times(obj)
        route_name = build_trip_route_name(stop_times)
        return route_name

    def get_plk_train_number(self, obj:CompleteTrip) -> str | None:
        return self._values(obj, 'plk_train_number')

    def get_carriages(self, obj:CompleteTrip) -> list:
        return self._values(obj, 'carriages')

    def get_routes(self, obj:CompleteTrip) -> list:
        return self._values(obj, 'route_id')
    
    def get_transfers(self, obj:CompleteTrip) -> list:
        transfers = [
            Transfer.objects.get(from_trip_id=from_trip)    
            for from_trip in obj.trip_ids[:-1]
        ]
        return  BaseTransferSerializer(transfers, many=True).data
    
    def get_trip_stop_times(self, obj: CompleteTrip) -> dict:
        stop_times = get_complete_trip_stop_times(obj)
        serialized = StopTimeSerializer(stop_times, many=True).data
        trip_stop_times = get_ordered_complete_trip_st(obj.trip_ids, serialized)
        return trip_stop_times

    def get_polylines(self, obj:CompleteTrip) -> list[str]:
        stop_times = get_complete_trip_stop_times(obj)
        serialized = PolylineStopTimeSerializer(stop_times, many=True).data
        trip_stop_times = get_ordered_complete_trip_st(obj.trip_ids, serialized)
        return get_complete_trip_polylines(trip_stop_times)

    class Meta:
        model = CompleteTrip
        fields = (
            'trip_short_name',
            'trip_route_name',
            'trip_headsign',
            'routes',
            'legs',
            'transfers',
            'plk_train_number',
            'carriages',
            'polylines',
            'trip_stop_times',
        )
