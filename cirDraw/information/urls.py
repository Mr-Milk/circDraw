from django.conf.urls import url
from . import views
from django.conf import settings


urlpatterns = [
	url(r'^about$', views.about, name = 'about'),
	url(r'^manual$', views.manual, name = 'manual'),
]