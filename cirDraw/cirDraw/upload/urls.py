from django.conf.urls import url
from . import views

urlpatterns = [
	# /upload/ ## mainpage
	url(r'^$', views.index, name = 'index'),
	url(r'^results/$', views.results, name='results')
]