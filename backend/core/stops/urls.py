from django.urls import path

from .views import *


urlpatterns = [
    path('', AllStopsView.as_view()),
    path('<str:stop_id>/schedule', StopScheduleView.as_view(), name='stop_schedule'),
]
