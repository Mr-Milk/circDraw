# Generated by Django 2.1 on 2018-09-21 14:32

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(blank=True, max_length=255)),
                ('document', models.FileField(upload_to='documents/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='eachObservation',
            fields=[
                ('circRNA_ID', models.CharField(max_length=200, primary_key=True, serialize=False)),
                ('chr_ci', models.CharField(blank=True, max_length=40, null=True)),
                ('circRNA_start', models.IntegerField(blank=True, null=True)),
                ('circRNA_end', models.IntegerField(blank=True, null=True)),
                ('SM_MS_SMS', models.CharField(max_length=40, null=True)),
                ('junction_reads', models.IntegerField(blank=True, null=True)),
                ('non_junction_reads', models.IntegerField(blank=True, null=True)),
                ('junction_reads_ratio', models.FloatField(null=True)),
                ('circRNA_type', models.CharField(blank=True, max_length=40, null=True)),
                ('gene_id', models.CharField(blank=True, max_length=100, null=True)),
                ('strand', models.CharField(max_length=100, null=True)),
                ('junction_reads_ID', models.CharField(max_length=500, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='uploadCase',
            fields=[
                ('whichcase', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
            ],
        ),
        migrations.AddField(
            model_name='eachobservation',
            name='caseid',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='upload.uploadCase'),
        ),
    ]