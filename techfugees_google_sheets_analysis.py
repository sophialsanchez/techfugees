# NOTES: If you want to run this locally, you will need to install gspread
# https://github.com/burnash/gspread
# If you already have pip, it's as easy as "pip install gspread" on the command line
# Also, the json file with all the fun Google authorization passwords you need
# is not shared in this repo.


# To Dos: make code faster, add checks for missing or corrupt data, update which sheet it points to (not the correct one now)

import csv
import json
import gspread
from oauth2client.client import SignedJwtAssertionCredentials
import pandas

#json_key = json.load(open('techfugees-41d6a19e279a.json'))
#scope = ['https://spreadsheets.google.com/feeds']

#credentials = SignedJwtAssertionCredentials(json_key['client_email'], json_key['private_key'].encode(), scope)
#data = gspread.authorize(credentials)
#wks = data.open("GITOC Migrant Leg Prices Database 1 October 2015.xlsx")
#wks = wks.get_worksheet(5)
wks = pandas.read_csv('Prices.csv', header=1)

def listAllCountryPaths(startCountry, endCountry):
	paths = findCountryPathRecursion(startCountry, endCountry)
	if startCountry == endCountry:
		print("The start and end countries must be different.")
	elif len(paths) == 0:
		print("We're sorry! There are no matching routes in our database for a trip from %s to %s." % (startCountry, endCountry))
	elif len(paths) == 1:
		print("There is 1 trip in our database from %s to %s. The path is:" % (startCountry, endCountry))
		print(paths[0][0::2]),
		price = int(paths[0][1])
		print("Trip price: %d" % price)
	else:
		print("There are %d trips in our database from %s to %s. The paths are:" % (len(paths), startCountry, endCountry))
		for path in paths:
			print(path[0::2]),
			price = sum(list(map(int, path[1::2])))
			print("Trip price: %d" % price)

def findCountryPathRecursion(startCountry, endCountry, path = []):
	path = path + [startCountry]
	if startCountry == endCountry:
		return [path]
	allStartCountries = wks['Start Country']
	indices = [i for i, x in enumerate(allStartCountries) if x == startCountry]
	if len(indices) == 0:
		return []
	paths = []
	for index in indices:
		nextCountry = wks['End Country'][index]
		if nextCountry not in path:
			print(nextCountry)
			print(path)
			#price = wks[' USD equiv avg '][index]
			#nationality = wks['Nationality of Migrant'][index]
			#service = wks['Service'][index]
			#tripData = [price, nationality, service]
			newpaths = findCountryPathRecursion(nextCountry, endCountry, path)
			for newpath in newpaths:
				paths.append(newpath)
	return paths


print(listAllCountryPaths('Syria', 'Germany'))
