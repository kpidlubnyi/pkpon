from rest_framework import serializers

from tasks.models import Stop

class BaseStopSerializer(serializers.ModelSerializer):
    stop_lng = serializers.CharField(source='stop_lon')

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