from django.db import models
from django.contrib.postgres.fields import ArrayField


class CompleteTrip(models.Model):
    trip_ids = ArrayField(models.CharField(max_length=32))
    stops = ArrayField(models.CharField(max_length=8))

    class Meta:
        db_table = 'trips_CompleteTrips'