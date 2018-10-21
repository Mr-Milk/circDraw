from django.conf.urls import url
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
	# /upload/ ## mainpage
	url(r'^$', views.index, name = 'index'),
	url(r'^results/$', views.results, name='results'),
	url(r'^display/$', views.display, name='upload_display'),
	url(r'^save/$', views.save, name='upload_save'),
	url(r'^tryupload/$', views.tryupload, name="upload_try"),
	url(r'^new/$', views.new),
	url(r'^new/upload&save/$', views.new_upload)
	#url(r'^saved/$', views.save),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
