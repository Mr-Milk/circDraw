from django.conf.urls import url
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [

    # Render pages
    url(r'^$', views.render_upload_page, name='tools'),
    url(r'^display/(?P<md5>[0-9a-f-]+)$', views.render_display_page, name="render_display"),

    # Upload
    url(r'^upload/$', views.save_to_files, name='upload&save'),
    url(r'^run/$', views.run_call, name='run'),


    # Check Status
    url(r'^statusfile/$', views.check_status),
    # Ajax call functions For Displays
    url(r'^display/chrLen/$', views.handle_chrLen, name="tools_chrLen"),
    url(r'^display/density/$', views.handle_density, name="tools_density"),
    url(r'^display/circrnas/$', views.handle_circrnas, name="tools_circRNAs"),
    url(r'^display/genes/$', views.handle_genes, name="tools_genes"),
    url(r'^display/downloadresult/$', views.download_UserFile, name="tools_downloadresult"),

    # charts
    url(r'^display/lenChart_URL/$', views.lenChart),
    # TopList
    url(r'^display/toplist/$', views.toplist),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

