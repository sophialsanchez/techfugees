from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^/queryByStartCity/(?P<slug1>[-\w\d]+)/(?P<slug2>[-\w\d\']+)$', views.queryByStartCity, name='queryByStartCity'),
    url(r'^/getCitiesInACountry/(?P<slug>[-\w\d]+)$', views.getCitiesInACountry, name='getCitiesInACountry'),
]