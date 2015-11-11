# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('map', '0002_auto_20151105_0303'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trip',
            name='comment',
            field=models.CharField(max_length=10000),
        ),
        migrations.AlterField(
            model_name='trip',
            name='source',
            field=models.CharField(max_length=10000),
        ),
    ]
