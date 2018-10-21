from django.conf.urls import url
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
	url(r'^$', views.render_upload_page, name='tools'), # render upload page
    url(r'^test_submit/$', views.upload_fine, name='test_submit'),
    url(r'^test_display/ec04092365e64a8aa1fc6e1e9ff9822c$', views.display_fine, name='test_display'),
    url(r'^submit/$', views.upload_and_save, name='upload&save'), # upload file; sink into db and return uuid -> redirct to /display/<uuid>
    url(r'^display/(?P<caseid>[0-9a-f-]+)$', views.render_display_page, name="render_display"), # already checked
    url(r'^display/file1$', views.handle_file1, name="tools_file1"),
    url(r'^display/file2$', views.handle_file2, name="tools_file2"),
    url(r'^display/file3$', views.handle_file3, name="tools_file3"),
    url(r'^display/file4$', views.handle_file4, name="tools_file4"),
    url(r'^display/file5$', views.handle_file5, name="tools_file5")
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
