from rest_framework.serializers import ModelSerializer, SerializerMethodField

from tasks.models import Stop

class BaseStopSerializer(ModelSerializer):
    class Meta:
        model = Stop
        fields = (
            'stop_id',
            'stop_name',
            'stop_lat',
            'stop_lon',
        )


class StopDetailedSerializer(ModelSerializer, BaseStopSerializer):
    recent_arrivals_departures = SerializerMethodField()

    def get_recent_arrivals_departures(self, obj:Stop):
        ...

    class Meta(BaseStopSerializer.Meta):
        fields = BaseStopSerializer.Meta.fields + ()