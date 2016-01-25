# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Trip',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('start', models.CharField(max_length=200)),
                ('start_country', models.CharField(max_length=200)),
                ('start_lat', models.CharField(max_length=200)),
                ('start_long', models.CharField(max_length=200)),
                ('end', models.CharField(max_length=200)),
                ('end_country', models.CharField(max_length=200)),
                ('end_lat', models.CharField(max_length=200)),
                ('end_long', models.CharField(max_length=200)),
                ('year', models.CharField(max_length=200)),
                ('price', models.CharField(max_length=200)),
                ('lower_bound', models.CharField(max_length=200)),
                ('upper_bound', models.CharField(max_length=200)),
                ('ccy', models.CharField(max_length=200)),
                ('USD_equiv', models.CharField(max_length=200)),
                ('USD_equiv_avg', models.CharField(max_length=200)),
                ('one_person', models.CharField(max_length=200)),
                ('nationality_of_migrant', models.CharField(max_length=200)),
                ('nationality_of_smuggler', models.CharField(max_length=200)),
                ('service', models.CharField(max_length=200)),
                ('via', models.CharField(max_length=200)),
                ('source', models.CharField(max_length=10000)),
                ('comment', models.CharField(max_length=10000)),
            ],
        ),
    ]
