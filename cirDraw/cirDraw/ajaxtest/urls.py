from django.conf.urls import url
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
	url(r'^try$', views.index),
	url(r'^json$', views.json),
	url(r'^external$', views.external)
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


