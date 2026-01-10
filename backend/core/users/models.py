from uuid import uuid4

from django.db import models

from tasks.models import Stop, Trip, StopTime


class User(models.Model):
    user_id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    username = models.CharField(max_length=32, unique=True)
    password = models.CharField(max_length=256)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'users_Users'


class SavedTransit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    from_stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='from_transits')
    to_stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='to_transits')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users_SavedTransits'
        unique_together = ('user', 'from_stop', 'to_stop')
        indexes = [models.Index(fields=['user'])]


class SavedTrip(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    from_stop_time = models.ForeignKey(StopTime, on_delete=models.CASCADE, related_name='from_stop_in_the_time')
    to_stop_time = models.ForeignKey(StopTime, on_delete=models.CASCADE, related_name='to_stop_in_the_time')
    is_relevant = models.BooleanField(default=True)

    class Meta:
        db_table = 'users_SavedTrips'
        unique_together = ('user', 'trip')
