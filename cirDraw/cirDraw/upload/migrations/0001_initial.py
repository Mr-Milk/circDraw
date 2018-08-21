# Generated by Django 2.1 on 2018-08-11 02:29

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CIRIdata',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('circRNA_ID', models.CharField(max_length=100)),
                ('chr_ci', models.CharField(max_length=40)),
                ('circRNA_start', models.IntegerField()),
                ('circRNA_end', models.IntegerField()),
                ('junction_reads', models.IntegerField()),
                ('non_junction_reads', models.IntegerField()),
                ('circRNA_type', models.CharField(max_length=100)),
                ('gene_id', models.CharField(max_length=100)),
            ],
        ),
    ]
