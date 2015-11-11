from django.db import models
import csv

class Trip(models.Model):
    start = models.CharField(max_length=200)
    start_country = models.CharField(max_length=200)
    start_lat = models.CharField(max_length=200)
    start_long = models.CharField(max_length=200)
    end = models.CharField(max_length=200)
    end_country = models.CharField(max_length=200)
    end_lat = models.CharField(max_length=200)
    end_long = models.CharField(max_length=200)
    year = models.CharField(max_length=200)
    price = models.CharField(max_length=200)
    lower_bound = models.CharField(max_length=200)
    upper_bound = models.CharField(max_length=200)
    ccy = models.CharField(max_length=200)
    USD_equiv = models.CharField(max_length=200)
    USD_equiv_avg = models.CharField(max_length=200)
    one_person = models.CharField(max_length=200)
    nationality_of_migrant = models.CharField(max_length=200)
    nationality_of_smuggler = models.CharField(max_length=200)
    service = models.CharField(max_length=200)
    via = models.CharField(max_length=200)
    source = models.CharField(max_length=10000)
    comment = models.CharField(max_length=10000)


with open('/Users/sophiasanchez/Desktop/personal-git/techfugees-old/Prices.csv') as f:
	reader = csv.reader(f)
	for row in reader:
		_, created = Trip.objects.get_or_create(
    		start = row[0],
    		start_country = row[1],
    		start_lat = row[2],
    		start_long = row[3],
    		end = row[4],
    		end_country = row[5],
    		end_lat = row[6],
    		end_long = row[7],
    		year = row[8],
    		price = row[9],
    		lower_bound = row[10],
    		upper_bound = row[11],
    		ccy = row[12],
    		USD_equiv = row[13],
    		USD_equiv_avg = row[14],
    		one_person = row[15],
    		nationality_of_migrant = row[16],
    		nationality_of_smuggler = row[17],
    		service = row[18],
    		via = row[19],
    		source = row[20],
    		comment = row[21]
	)