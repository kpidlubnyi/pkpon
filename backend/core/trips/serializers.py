from collections import Counter

from rest_framework.serializers import ModelSerializer, SerializerMethodField
from stops.serializers import BaseStopTimeSerializer
from tasks.models import Route, Trip, StopTime
from trips.models import CompleteTrip


class BaseRouteSerializers(ModelSerializer):
    class Meta:
        model = Route
        fields = (
            'route_id',
            'route_short_name',
            'route_long_name',
            'route_type',
        )


class BaseTripSerializer(ModelSerializer):
    trip_stops = SerializerMethodField()
    route = BaseRouteSerializers()

    def get_trip_stops(self, obj:Trip):
        stop_times = StopTime.objects.filter(trip_id=obj.trip_id)
        serialized = BaseStopTimeSerializer(stop_times, many=True).data
        return serialized 

    class Meta:
        model = Trip
        fields = (
            'route',
            'trip_id',
            'trip_headsign',
            'trip_short_name',
            'plk_train_number',
            'carriages',
            'trip_stops',
        )


class BaseCompleteTripSerializer(ModelSerializer):
    trip_short_name = SerializerMethodField()
    trip_headsign = SerializerMethodField()
    routes = SerializerMethodField()
    legs = SerializerMethodField()
    plk_train_number = SerializerMethodField()
    carriages = SerializerMethodField()

    def _get_trips(self, obj) -> list[dict]:
        if not hasattr(self, '_trips_cache'):
            self._trips_cache = list(
                Trip.objects
                .filter(trip_id__in=obj.trip_ids)
                .values(
                    'trip_short_name',
                    'trip_headsign',
                    'route_id',
                    'plk_train_number',
                    'carriages',
                )
            )
        return self._trips_cache

    def _values(self, obj, key):
        return [trip[key] for trip in self._get_trips(obj) if trip[key] is not None]

    def _most_common(self, obj, key):
        values = self._values(obj, key)
        if not values:
            return None
        return Counter(values).most_common(1)[0][0]

    def get_legs(self, obj) -> int:
        return len(self._get_trips(obj))

    def get_trip_headsign(self, obj) -> str | None:
        return self._most_common(obj, 'trip_headsign')

    def get_trip_short_name(self, obj) -> str | None:
        return self._most_common(obj, 'trip_short_name')

    def get_plk_train_number(self, obj) -> str | None:
        return self._most_common(obj, 'plk_train_number')

    def get_carriages(self, obj) -> list:
        return list(set(self._values(obj, 'carriages')))

    def get_routes(self, obj) -> list:
        return list(set(self._values(obj, 'route_id')))

    class Meta:
        model = CompleteTrip
        fields = (
            'trip_short_name',
            'trip_headsign',
            'routes',
            'legs',
            'plk_train_number',
            'carriages',
        )
