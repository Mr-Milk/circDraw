from django.conf.urls import url
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
	url(r'^$', views.tools, name='tools'),
	url(r'^display/$', views.display, name='tool_display'),
	url(r'^save/$', views.save, name='tools_save'  ),
	url(r'^lenChart/$', views.lenChart),
	url(r'^exonChart/$', views.exonChart)
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
