from .common import *


class CalendarStaging(AbstractCalendar):
    _base_model = Calendar

    class Meta:
        db_table = 'staging_Calendars'


class RouteStaging(AbstractRoute):
    _base_model = Route

    class Meta:
        db_table = 'staging_Routes'


class StopStaging(AbstractStop):
    _base_model = Stop
    
    class Meta:
        db_table = 'staging_Stops'


class TripStaging(AbstractTrip):
    route = ForeignKey(RouteStaging, on_delete=CASCADE)
    service = ForeignKey(CalendarStaging, on_delete=CASCADE)
    
    _base_model = Trip

    class Meta:
        db_table = 'staging_Trips'


class StopTimeStaging(AbstractStopTime):
    stop = ForeignKey(StopStaging, on_delete=CASCADE)
    trip = ForeignKey(TripStaging, on_delete=CASCADE)

    _base_model = StopTime

    class Meta:
        db_table = 'staging_StopTimes'
        unique_together = [['trip', 'stop_sequence']]


class TranferStaging(AbstractTransfer):
    from_stop = ForeignKey(StopStaging, on_delete=CASCADE, related_name='st_transfers_from')
    to_stop = ForeignKey(StopStaging, on_delete=CASCADE, related_name='st_transfers_to')
    from_trip = ForeignKey(TripStaging, on_delete=CASCADE, related_name='st_transfers_from')
    to_trip = ForeignKey(TripStaging, on_delete=CASCADE, related_name='st_transfers_to')

    _base_model = Tranfer

    class Meta:
        db_table = 'staging_Transfers'
