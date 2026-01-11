from rest_framework import serializers

from tasks.models import Stop, StopTime

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


# class StopDetailedSerializer(BaseStopSerializer, ModelSerializer):
#     recent_arrivals_departures = SerializerMethodField()

#     def get_recent_arrivals_departures(self, obj:Stop):
#         ...

#     class Meta(BaseStopSerializer.Meta):
#         fields = BaseStopSerializer.Meta.fields + ()


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