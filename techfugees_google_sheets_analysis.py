# NOTES: If you want to run this locally, you will need to install gspread
# https://github.com/burnash/gspread
# If you already have pip, it's as easy as "pip install gspread" on the command line
# Also, the json file with all the fun Google authorization passwords you need
# is not shared in this repo.

import json
import gspread
from oauth2client.client import SignedJwtAssertionCredentials

json_key = json.load(open('techfugees-41d6a19e279a.json'))
scope = ['https://spreadsheets.google.com/feeds']

credentials = SignedJwtAssertionCredentials(json_key['client_email'], json_key['private_key'].encode(), scope)
data = gspread.authorize(credentials)
wks = data.open("GITOC Migrant Leg Prices Database 1 October 2015.xlsx").sheet1

def findCountryPath(startCountry, endCountry):
	paths = findCountryPathRecursion(startCountry, endCountry, 0)

	if len(paths) == 0:
		print("We're sorry! There are no matching routes in our database for a trip from %s to %s." % (startCountry, endCountry))
	elif len(paths) == 1:
		print("There is 1 trip in our database from %s to %s. The path is:" % (startCountry, endCountry))
		print(path)
	else:
		print("There are %d trips in our database from %s to %s. The paths are:" % (len(paths), startCountry, endCountry))
		for path in paths:
			print(path)

def findCountryPathRecursion(startCountry, endCountry, matches, path = []):
	path = path + [startCountry]
	if startCountry == endCountry:
		return [path]

	allStartCountries = wks.col_values(1) # looks at the 'Start' column
	indices = [i for i, x in enumerate(allStartCountries) if x == startCountry]

	if len(indices) == 0:
		return []
	paths = []
	for index in indices:
		nextCountry = wks.cell(index + 1, 2).value # looks at the 'End' column for that row
		if nextCountry not in path:
			newpaths = findCountryPathRecursion(nextCountry, endCountry, matches, path)
			for newpath in newpaths:
				paths.append(newpath)
	return paths



findCountryPath('Niger', 'Libya')



