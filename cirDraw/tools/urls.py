from django.conf.urls import url
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [

    # Render pages
    url(r'^$', views.render_upload_page, name='tools'),
    url(r'^display/(?P<md5>[0-9a-f-]+)$', views.render_display_page, name="render_display"),

    # Upload
    # url(r'^upload/$', views.upload_and_save, name='upload&save'),
    url(r'^upload/$', views.save_to_files, name='upload&save'),

    # Run pre-process
    # url(r'^run/$', views.run_density),
    # url(r'^run/$', views.pixel_run_density),
    #pixel_run_density



    # Check Status
    url(r'^statusfile/$', views.check_status),

    # Ajax call functions
    # url(r'^display/tools_file1/$', views.handle_file1, name="tools_file1"),
    # url(r'^display/tools_file2/$', views.handle_file2, name="tools_file2"),
    # url(r'^display/genList/$', views.genList),
    # url(r'^tools_file4/$', views.handle_file4, name="tools_file4"),
    # url(r'^tools_file5/$', views.handle_file5, name="tools_file5"),

    url(r'^display/chrLen/$', views.handle_chrLen, name="tools_chrLen"),
    url(r'^display/density/$', views.handle_density, name="tools_density"),
    url(r'^display/circrnas/$', views.handle_circrnas, name="tools_circRNAs"),
    url(r'^display/genes/$', views.handle_genes, name="tools_genes"),
    url(r'^display/downloadresult/$', views.download_UserFile, name="tools_downloadresult"),


    # charts
    url(r'^display/lenChart_URL/$', views.lenChart),
    # url(r'^display/exonChart_URL/$', views.exonChart),
    # url(r'^isoChart_URL/$', views.isoChart),

    # dev testing urls
    # url(r'^test/$', views.render_display_page_test),

    # Biocircos
    # url(r'^display/URL.DENSITY/$', views.handle_biocircos_density),

    # TopList
    url(r'^display/toplist/$', views.toplist),

    # example
    #url(r'^display/example', views.store_example, name="example"),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

