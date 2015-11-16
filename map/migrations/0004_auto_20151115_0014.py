# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models

import csv
import os


def load_prices(app, _schema_editor):
  Trip = app.get_model(app_label='map', model_name='Trip')

  with open(os.path.join(settings.BASE_DIR, 'Prices.csv')) as f:
    reader = csv.reader(f)
    for row in reader:
      trip = Trip(
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
      trip.save()


class Migration(migrations.Migration):

    dependencies = [
        ('map', '0003_auto_20151105_0307'),
    ]

    operations = [
      migrations.RunPython(load_prices),
    ]
