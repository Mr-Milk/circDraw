from django.conf.urls import url
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
	url(r'^$', views.tools, name='tools'),
	url(r'^upload&save/$', views.save),
	url(r'^display/$', views.display, name='tools_display'),
	#url(r'^save/$', views.save, name='tools_save'),
	url(r'^draw/$', views.draw, name='tools_draw'),
	url(r'^chrstartend/', views.chrstartend, name='tools_chrstartend')
	#url(r'^lenChart/$', views.lenChart),
	#url(r'^exonChart/$', views.exonChart)
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
