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

def makeAdjRepList(worksheet):
	graph = {}
	i = 0
	for country in worksheet['Start Country']:
		if country in graph:
			boolVal = any(worksheet['End Country'][i] in x for x in graph[country])
			if country != worksheet['End Country'][i] and boolVal == False: # if country that you want to insert as the value is not already the key, and it is not already a value
				graph[country] = graph[country] + [[worksheet['End Country'][i], [worksheet[' USD equiv avg '][i]]]] # append it
			elif country != worksheet['End Country'][i]:
				temp = graph[country]
				for item in temp:
					if item[0] == worksheet['End Country'][i]:
						item[1].append(worksheet[' USD equiv avg '][i])
				graph[country] = temp
		else:
			if country != worksheet['End Country'][i]:
				graph[country] = [[worksheet['End Country'][i], [worksheet[' USD equiv avg '][i]]]]
		i += 1
	return graph



def listAllCountryPaths(wks, startCountry, endCountry):
	paths = findCountryPathRecursion(wks, startCountry, endCountry)
	if startCountry == endCountry:
		print("The start and end countries must be different.")
	elif len(paths) == 0:
		print("We're sorry! There are no matching routes in our database for a trip from %s to %s." % (startCountry, endCountry))
	elif len(paths) == 1:
		print("There is 1 trip in our database from %s to %s. The path is:" % (startCountry, endCountry))
		print(paths)
		#print(paths[0][0::2]),
		#price = int(paths[0][1])
		#print("Trip price: %d" % price)
	else:
		print("There are %d trips in our database from %s to %s. The paths are:" % (len(paths), startCountry, endCountry))
		for path in paths:
			print(path)
			#print(path[0::2]),
			#price = sum(list(map(int, path[1::2])))
			#print("Trip price: %d" % price)
		print(len(paths))


def findCountryPathRecursion(wks, startCountry, endCountry, path = []):
	path = path + [startCountry]
	if startCountry == endCountry:
		return [path]
	if startCountry not in wks:
		return []
	paths = []
	for node in wks[startCountry]:
		if node[0] not in path:
			travelData = [node[1]]
			newpaths = findCountryPathRecursion(wks, node[0], endCountry, path + travelData)
			for newpath in newpaths:
				paths.append(newpath)
	return paths

def findCheapest(paths):
	for path in paths:
		for price in int(map(int, path[1::2])):




					#price = wks[' USD equiv avg '][index]
			#nationality = wks['Nationality of Migrant'][index]
			#service = wks['Service'][index]
			#tripData = [price, nationality, service]

myWorksheet = makeAdjRepList(pandas.read_csv('Prices.csv', header=1))
print(myWorksheet)
listAllCountryPaths(myWorksheet, 'Syria', 'Germany')
