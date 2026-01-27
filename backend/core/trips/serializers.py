from collections import Counter

from rest_framework import serializers
from stops.serializers import PolylineStopTimeSerializer, StopTimeSerializer, ScheduleStopTimeSerializer
from tasks.models import Route, Trip, Transfer
from trips.models import CompleteTrip
from trips.services.serializers import *


class BaseRouteSerializers(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = (
            'route_id',
            'route_short_name',
            'route_long_name',
            'route_type',
        )

class BaseTransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transfer
        fields = (
            'transfer_type',
            'from_trip_id',
            'to_trip_id',
        )

class BaseCompleteTripSerializer(serializers.ModelSerializer):
    trip_short_name = serializers.SerializerMethodField()
    trip_route_name = serializers.SerializerMethodField()
    trip_headsign = serializers.SerializerMethodField()
    routes = serializers.SerializerMethodField()
    legs = serializers.SerializerMethodField()
    transfers = serializers.SerializerMethodField()
    plk_train_number = serializers.SerializerMethodField()
    carriages = serializers.SerializerMethodField()
    polylines = serializers.SerializerMethodField()
    trip_stop_times = serializers.SerializerMethodField()

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


class UserTripSearchCompleteTripSerializer(BaseCompleteTripSerializer):
    departure_stop_time = serializers.SerializerMethodField()
    arrival_stop_time = serializers.SerializerMethodField()

    def _find_needed_stop_time(self, obj, stop_id):
        return (
            StopTime.objects
            .filter(trip_id__in=obj.trip_ids, stop__stop_id=stop_id)
            .select_related('stop')
            .order_by('stop_sequence')
            .first()
        )
    
    def get_departure_stop_time(self, obj:CompleteTrip) -> dict:
        from_stop = self.context.get('from_stop')
        from_stop_time = self._find_needed_stop_time(obj, from_stop)
        return ScheduleStopTimeSerializer(from_stop_time).data
    
    def get_arrival_stop_time(self, obj:CompleteTrip) -> dict:
        to_stop = self.context.get('to_stop')
        to_stop_time = self._find_needed_stop_time(obj, to_stop)
        return ScheduleStopTimeSerializer(to_stop_time).data

    class Meta(BaseCompleteTripSerializer.Meta):
        fields = (
           'trip_ids',
            'routes',
            'legs',
            'plk_train_number',
            'departure_stop_time',
            'arrival_stop_time',
        )


class UserTripSearchSerializer(serializers.Serializer):
    date = serializers.DateField(required=False, allow_null=True)
    time = serializers.TimeField(required=False, allow_null=True)
    from_stop = serializers.CharField()
    to_stop = serializers.CharField()

    def validate(self, attrs):
        now = tz.localtime()

        if not attrs.get('date'):
            attrs['date'] = now.date()

        if not attrs.get('time'):
            attrs['time'] = now.time()

        return attrs
