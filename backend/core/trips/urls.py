from django.urls import path

from .views import *


urlpatterns = [
    path('search/', UserTripsView.as_view()),
    path('<str:trip_id>/', TripView.as_view()),
]
