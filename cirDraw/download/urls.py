from django.conf.urls import url
from django.conf import settings
from . import views

urlpatterns = [
	url(r'^$', views.index, name = 'download'),
]


