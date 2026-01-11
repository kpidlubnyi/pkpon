from django.db.models import CASCADE, ForeignKey

from .abstract import (
    AbstractCalendar, AbstractRoute, AbstractStop,
    AbstractTrip, AbstractTransfer, AbstractStopTime
)


class Calendar(AbstractCalendar):
    class Meta:
        db_table = 'common_Calendars'


class Route(AbstractRoute):
    class Meta:
        db_table = 'common_Routes'


class Stop(AbstractStop):
    class Meta:
        db_table = 'common_Stops'


class Trip(AbstractTrip):
    route = ForeignKey(Route, on_delete=CASCADE)
    service = ForeignKey(Calendar, on_delete=CASCADE)
    
    class Meta:
        db_table = 'common_Trips'

class StopTime(AbstractStopTime):
    stop = ForeignKey(Stop, on_delete=CASCADE)
    trip = ForeignKey(Trip, on_delete=CASCADE)

    class Meta:
        db_table = 'common_StopTimes'
        unique_together = [['trip', 'stop_sequence']]


class Transfer(AbstractTransfer):
    from_stop = ForeignKey(Stop, on_delete=CASCADE, related_name='transfers_from')
    to_stop = ForeignKey(Stop, on_delete=CASCADE, related_name='transfers_to')
    from_trip = ForeignKey(Trip, on_delete=CASCADE, related_name='transfers_from')
    to_trip = ForeignKey(Trip, on_delete=CASCADE, related_name='transfers_to')

    class Meta:
        db_table = 'common_Transfers'

    

