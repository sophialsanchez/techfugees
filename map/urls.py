from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^query/(?P<slug>[-\w\d]+)/$', views.query, name='query'),
]