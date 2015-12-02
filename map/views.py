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
	if "-" in slug:
		slug = slug.replace("-", " ")
	trips = Trip.objects.filter(start_country = slug)
	countries = {}
	for trip in trips:
		if trip.start_country != trip.end_country:
			if trip.end_country not in countries:
				countries[trip.end_country] = {trip.service: {trip.year: [trip.USD_equiv_avg]}}
			else:
				if trip.service in countries[trip.end_country]:
					if trip.year in countries[trip.end_country][trip.service]:
						prices = countries[trip.end_country][trip.service][trip.year]
						prices.append(trip.USD_equiv_avg)
						countries[trip.end_country][trip.service][trip.year] = prices
					else:
						countries[trip.end_country][trip.service][trip.year] = [trip.USD_equiv_avg]
				else:
					countries[trip.end_country][trip.service] = {trip.year: [trip.USD_equiv_avg]}

	for key, value in countries.iteritems():
		for keyService, valueService in countries[key].iteritems():
			for keyYear, valueYear in countries[key][keyService].iteritems():
				pricesAsIntegers = [int(re.sub("\D", "", i)) for i in valueYear]
				avgPrice = int(sum(pricesAsIntegers))/len(pricesAsIntegers) if len(pricesAsIntegers) > 0 else float('nan')
				countries[key][keyService][keyYear] = avgPrice
	return HttpResponse(json.dumps(countries))