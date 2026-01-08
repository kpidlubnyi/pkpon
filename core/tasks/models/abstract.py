from django.db import models
from django.contrib.postgres.fields import ArrayField


class AbstractCalendar(models.Model):
    service_id = models.CharField(max_length=10, primary_key=True)
    start_date = models.CharField(max_length=8)
    end_date = models.CharField(max_length=8)
    weekdays_availability = ArrayField(models.SmallIntegerField(), 7)

    class Meta:
        abstract = True


class AbstractRoute(models.Model):
    class RouteTypeChoice(models.IntegerChoices):
        RAIL = 2
        BUS = 3

    route_id = models.CharField(max_length=8, primary_key=True)
    route_short_name = models.CharField(max_length=8)
    route_long_name = models.CharField(max_length=128)
    route_type = models.IntegerField(choices=RouteTypeChoice)
    route_color = models.CharField(max_length=6)
    route_text_color =  models.CharField(max_length=6)

    class Meta:
        abstract = True


class AbstractStop(models.Model):
    stop_id = models.CharField(max_length=8, primary_key=True)
    stop_name = models.CharField(max_length=128)
    stop_lat = models.FloatField()
    stop_lon = models.FloatField()

    class Meta:
        abstract = True


class AbstractStopTime(models.Model):
    stop_sequence = models.IntegerField()
    arrival_time = models.CharField(max_length=8)
    departure_time = models.CharField(max_length=8)
    platform = models.SmallIntegerField()
    track = models.CharField(max_length=8)
    fare_dist_m = models.IntegerField()
    vehicle_kind = models.CharField(max_length=16)

    class Meta:
        abstract = True


class AbstractTransfer(models.Model):
    class TransferTypeChoice(models.IntegerChoices):
        TIMED = 1
        IN_SEAT = 4

    transfer_type = models.IntegerField(choices=TransferTypeChoice)

    class Meta:
        abstract = True


class AbstractTrip(models.Model):
    trip_id = models.CharField(max_length=32, primary_key=True)
    trip_headsign = models.CharField(max_length=128)
    trip_short_name = models.CharField(max_length=32, null=True)
    block_id = models.IntegerField(null=True)
    plk_train_number = models.CharField(max_length=64)
    carriages = models.CharField(max_length=128, null=True) 

    class Meta:
        abstract = True
