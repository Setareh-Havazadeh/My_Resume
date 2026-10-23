from django.urls import path
from .views import *

app_name = "mysite"

urlpatterns = [
    path('',home_view , name="index"),
    path('404/',view_404 , name="view_404")
    ]
