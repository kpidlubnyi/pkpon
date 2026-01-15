from collections import Counter, defaultdict

from rest_framework.serializers import ModelSerializer, SerializerMethodField
from stops.serializers import BaseStopTimeSerializer
from tasks.models import Route, Trip, StopTime
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


class BaseTripSerializer(ModelSerializer):
    trip_stop_times = SerializerMethodField()
    route = BaseRouteSerializers()
    polyline = SerializerMethodField()

    def _stop_times(self, obj:Trip) -> list[StopTime]:
        if not hasattr(self, '_stop_times_cache'):
            self._stop_times_cache = StopTime.objects.filter(trip_id=obj.trip_id).select_related()
        return self._stop_times_cache
    
    def get_trip_stop_times(self, obj:Trip) -> list[dict]:
        stop_times = self._stop_times(obj)
        serialized = BaseStopTimeSerializer(stop_times, many=True).data
        return serialized 
    
    def get_polyline(self, obj:Trip):
        return get_trip_polyline(self._stop_times(obj))
        

    class Meta:
        model = Trip
        fields = (
            'route',
            'trip_id',
            'trip_headsign',
            'trip_short_name',
            'plk_train_number',
            'carriages',
            'polyline',
            'trip_stop_times',
        )


class BaseCompleteTripSerializer(ModelSerializer):
    trip_stop_times = SerializerMethodField()
    trip_short_name = SerializerMethodField()
    trip_headsign = SerializerMethodField()
    routes = SerializerMethodField()
    legs = SerializerMethodField()
    plk_train_number = SerializerMethodField()
    carriages = SerializerMethodField()
    polylines = SerializerMethodField()

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
    
    def _stop_times_by_trip(self, obj: CompleteTrip) -> dict[str, list[StopTime]]:
        if not hasattr(self, '_stop_times_by_trip_cache'):
            stop_times = (
                StopTime.objects
                .filter(trip_id__in=obj.trip_ids)
                .select_related()
                .order_by('trip_id', 'stop_sequence')
            )

            d = defaultdict(list)
            for st in stop_times:
                d[st.trip_id].append(st)

            self._stop_times_by_trip_cache = d

        return self._stop_times_by_trip_cache    
    
    def _values(self, obj, key):
        return [trip[key] for trip in self._trips(obj) if trip[key] is not None]

    def _most_common(self, obj, key):
        values = self._values(obj, key)
        if not values:
            return None
        return Counter(values).most_common(1)[0][0]

    def get_legs(self, obj) -> int:
        return len(self._trips(obj))

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
    
    def get_trip_stop_times(self, obj: CompleteTrip):
        l = len(obj.trip_ids)
        stop_times_by_trip = self._stop_times_by_trip(obj)

        stop_times = []
        for i, trip_id in enumerate(obj.trip_ids):
            trip_stop_times = stop_times_by_trip[trip_id]
            st_l = len(trip_stop_times)

            lim = st_l - 1 if i != l else st_l

            serialized = BaseStopTimeSerializer(trip_stop_times[:lim], many=True).data
            stop_times.extend(serialized)

        for i, stop_time in enumerate(stop_times):
            stop_time['stop_sequence'] = i

        return stop_times
    
    def get_polylines(self, obj:CompleteTrip):
        return get_complete_trip_polylines(obj.trip_ids, self._stop_times_by_trip(obj))

    class Meta:
        model = CompleteTrip
        fields = (
            'trip_short_name',
            'trip_headsign',
            'routes',
            'legs',
            'plk_train_number',
            'carriages',
            'polylines',
            'trip_stop_times',
        )
