# Generated by Django 2.1.1 on 2018-10-13 06:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='uploadeachobservation',
            name='caseid',
        ),
        migrations.DeleteModel(
            name='UploadEachobservation',
        ),
        migrations.DeleteModel(
            name='UploadUploadcase',
        ),
    ]