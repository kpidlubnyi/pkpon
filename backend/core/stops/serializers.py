from django.utils import timezone as tz
from rest_framework import serializers

from tasks.models import Stop, StopTime
from stops.services.views import *


class StopScheduleSerializer(serializers.Serializer):
    date = serializers.DateField(required=False, allow_null=True)
    time = serializers.TimeField(required=False, allow_null=True)
    direction = serializers.ChoiceField(
        choices=('departures', 'arrivals'),
        default='departures'
    )

    def validate(self, attrs):
        now = tz.localtime()

        if not attrs.get('date'):
            attrs['date'] = now.date()

        if not attrs.get('time'):
            attrs['time'] = now.time()

        return attrs


class BaseStopSerializer(serializers.ModelSerializer):
    stop_lng = serializers.FloatField(source='stop_lon')

    class Meta:
        model = Stop
        fields = (
            'stop_id',
            'stop_name',
            'stop_lat',
            'stop_lng',
        )


class BaseStopTimeSerializer(serializers.ModelSerializer):
    stop = BaseStopSerializer()
    
    class Meta:
        model = StopTime
        fields = (
            'trip_id',
            'stop',
            'stop_sequence',
            'arrival_time',
            'departure_time',
            'platform',
            'track',
            'fare_dist_m',
            'vehicle_kind',
        )
