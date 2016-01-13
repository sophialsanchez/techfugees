from django.shortcuts import render
from django.db import connection
from django.http import HttpResponse
from .models import Trip
import json
import re

def index(request):
    latest_question_list = Trip.objects.all()
    return render(request, 'map/index.html')

def getCitiesInACountry(request, slug):
	if "-" in slug:
		slug = slug.replace("-", " ")
	trips = Trip.objects.filter(start_country = slug)
	country = {}
	cities = []
	for trip in trips:
		cities.append(trip.start)
	citiesSet = list(set(cities))
	country[slug] = citiesSet
	return HttpResponse(json.dumps(country))

def queryByStartCity(request, slug1, slug2):
	if "-" in slug1:
		slug1 = slug1.replace("-", " ")
	if "-" in slug2:
		slug2 = slug2.replace("-", " ")
	trips = Trip.objects.filter(start_country = slug1, start = slug2)

	countries = {}
	for trip in trips:
		trip.service = trip.service.strip()
		if trip.service == "Unclear":
			trip.service = "Unknown"
		if trip.start_country != trip.end_country:
			if trip.end_country not in countries:
				countries[trip.end_country] = {trip.end: {trip.service: {trip.year: [trip.USD_equiv_avg]}}}
			else:
				if trip.end in countries[trip.end_country]:
					if trip.service in countries[trip.end_country]:
						if trip.year in countries[trip.end_country][trip.end][trip.service]:
							prices = countries[trip.end_country][trip.end][trip.service][trip.year]
							prices.append(trip.USD_equiv_avg)
							countries[trip.end_country][trip.end][trip.service][trip.year] = prices
						else:
							countries[trip.end_country][trip.end][trip.service][trip.year] = [trip.USD_equiv_avg]
					else:
						countries[trip.end_country][trip.end][trip.service] = {trip.year: [trip.USD_equiv_avg]}
				else:
					countries[trip.end_country][trip.end] = {trip.service: {trip.year: [trip.USD_equiv_avg]}}

	for key, value in countries.iteritems():
		for keyEnd, valueEnd in countries[key].iteritems():
			for keyService, valueService in countries[key][keyEnd].iteritems():
				for keyYear, valueYear in countries[key][keyEnd][keyService].iteritems():
					pricesAsIntegers = [int(re.sub("\D", "", i)) for i in valueYear]
					avgPrice = int(sum(pricesAsIntegers))/len(pricesAsIntegers) if len(pricesAsIntegers) > 0 else float('nan')
					countries[key][keyEnd][keyService][keyYear] = avgPrice
	return HttpResponse(json.dumps(countries))

def query(request, slug):
	if "-" in slug:
		slug = slug.replace("-", " ")
	trips = Trip.objects.filter(start_country = slug)

	countries = {}
	for trip in trips:
		trip.service = trip.service.strip()
		if trip.service == "Unclear":
			trip.service = "Unknown"
		if trip.start_country != trip.end_country:
			if trip.end_country not in countries:
				countries[trip.end_country] = {trip.end: {trip.service: {trip.year: [trip.USD_equiv_avg]}}}
			else:
				if trip.end in countries[trip.end_country]:
					if trip.service in countries[trip.end_country]:
						if trip.year in countries[trip.end_country][trip.end][trip.service]:
							prices = countries[trip.end_country][trip.end][trip.service][trip.year]
							prices.append(trip.USD_equiv_avg)
							countries[trip.end_country][trip.end][trip.service][trip.year] = prices
						else:
							countries[trip.end_country][trip.end][trip.service][trip.year] = [trip.USD_equiv_avg]
					else:
						countries[trip.end_country][trip.end][trip.service] = {trip.year: [trip.USD_equiv_avg]}
				else:
					countries[trip.end_country][trip.end] = {trip.service: {trip.year: [trip.USD_equiv_avg]}}

	for key, value in countries.iteritems():
		for keyEnd, valueEnd in countries[key].iteritems():
			for keyService, valueService in countries[key][keyEnd].iteritems():
				for keyYear, valueYear in countries[key][keyEnd][keyService].iteritems():
					pricesAsIntegers = [int(re.sub("\D", "", i)) for i in valueYear]
					avgPrice = int(sum(pricesAsIntegers))/len(pricesAsIntegers) if len(pricesAsIntegers) > 0 else float('nan')
					countries[key][keyEnd][keyService][keyYear] = avgPrice
	return HttpResponse(json.dumps(countries))