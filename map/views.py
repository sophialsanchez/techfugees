from django.shortcuts import render
from django.db import connection
from django.http import HttpResponse
from .models import Trip
import json
import re

def index(request):
    latest_question_list = Trip.objects.all()
    return render(request, 'map/index.html')


def query(request, slug):
	trips = Trip.objects.filter(start_country = slug)
	countries = {}
	for trip in trips:
		if trip.start_country != trip.end_country:
			if trip.end_country not in countries:
				countries[trip.end_country] = [trip.USD_equiv_avg]
			else:
				prices = countries[trip.end_country]
				prices.append(trip.USD_equiv_avg)
				countries[trip.end_country] = prices
	for key, value in countries.iteritems():
		pricesAsIntegers = [int(re.sub("\D", "", i)) for i in value]
		avgPrice = int(sum(pricesAsIntegers))/len(pricesAsIntegers) if len(pricesAsIntegers) > 0 else float('nan')
		countries[key] = avgPrice
	return HttpResponse(json.dumps(countries))