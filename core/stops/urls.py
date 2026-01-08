from django.urls import path

from .views import *



urlpatterns = [
    path('', AllStopsView.as_view()),
    path('<int:stop_id>/', StopView.as_view(), name='stop'),
]
