"""cirDraw URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.conf import settings
from django.contrib import admin
from django.conf.urls import url, include
from django.urls import path
from tools import views as toolviews




urlpatterns = [
	#url(r'^$', current_datetime),
    url(r'^$', toolviews.render_index_page, name = 'home'),
    url(r'^example/$', toolviews.view_example, name="example"),
    url(r'^admin/', admin.site.urls),
    url(r'^tools/', include('tools.urls')),
    url(r'^diy/', include('diy.urls')),
    url(r'^download/', include('download.urls')),
    url(r'^information/', include('information.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
