# Generated by Django 2.1.4 on 2019-03-16 12:51

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ToolsAnnotation',
            fields=[
                ('gene_type', models.CharField(max_length=50)),
                ('gene_name', models.CharField(max_length=200)),
                ('chr_ci', models.CharField(max_length=50)),
                ('gene_start', models.IntegerField()),
                ('gene_end', models.IntegerField()),
                ('gene_id', models.CharField(max_length=200, primary_key=True, serialize=False)),
                ('species', models.CharField(max_length=200)),
            ],
            options={
                'db_table': 'tools_annotation',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ToolsScalegenome',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('species', models.CharField(max_length=300)),
                ('chr_ci', models.CharField(max_length=30)),
                ('gene_min_start', models.IntegerField()),
                ('gene_max_end', models.IntegerField()),
                ('genelens_wiki', models.IntegerField()),
            ],
            options={
                'db_table': 'tools_scalegenome',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ToolsChromosome',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chr_ci', models.CharField(max_length=50)),
                ('chr_start', models.IntegerField()),
                ('chr_end', models.IntegerField()),
                ('max_length_circ', models.IntegerField()),
                ('min_length_circ', models.IntegerField()),
            ],
            options={
                'db_table': 'tools_chromosome',
            },
        ),
        migrations.CreateModel(
            name='ToolsEachobservation',
            fields=[
                ('circRNA_ID', models.CharField(db_column='circRNA_ID', max_length=200)),
                ('chr_ci', models.CharField(blank=True, max_length=40, null=True)),
                ('circRNA_start', models.IntegerField(blank=True, db_column='circRNA_start', null=True)),
                ('circRNA_end', models.IntegerField(blank=True, db_column='circRNA_end', null=True)),
                ('SM_MS_SMS', models.CharField(blank=True, db_column='SM_MS_SMS', max_length=40, null=True)),
                ('junction_reads', models.IntegerField(blank=True, null=True)),
                ('non_junction_reads', models.IntegerField(blank=True, null=True)),
                ('junction_reads_ratio', models.FloatField(blank=True, null=True)),
                ('circRNA_type', models.CharField(blank=True, db_column='circRNA_type', max_length=40, null=True)),
                ('gene_id', models.CharField(blank=True, max_length=100, null=True)),
                ('strand', models.CharField(blank=True, max_length=100, null=True)),
                ('junction_reads_id', models.CharField(blank=True, db_column='junction_reads_ID', max_length=500, null=True)),
                ('circ_id', models.AutoField(primary_key=True, serialize=False)),
            ],
            options={
                'db_table': 'tools_eachobservation',
            },
        ),
        migrations.CreateModel(
            name='ToolsUploadcase',
            fields=[
                ('whichcase', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
            ],
            options={
                'db_table': 'tools_uploadcase',
            },
        ),
        migrations.CreateModel(
            name='UploadParametersMD5',
            fields=[
                ('md5', models.CharField(db_column='MD5', max_length=32, primary_key=True, serialize=False)),
                ('status', models.BooleanField(db_column='Status', default=False)),
                ('file_type', models.CharField(db_column='FileType', max_length=100)),
                ('path', models.CharField(db_column='path', max_length=200)),
                ('species', models.CharField(db_column='Species', max_length=400)),
                ('denvalue', models.IntegerField(db_column='denvalue')),
                ('time', models.FloatField(db_column='time_created')),
            ],
            options={
                'db_table': 'tools_uploadmd5',
            },
        ),
        migrations.AddField(
            model_name='toolseachobservation',
            name='caseid',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='tools.UploadParametersMD5'),
        ),
        migrations.AddField(
            model_name='toolschromosome',
            name='caseid',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='tools.ToolsUploadcase'),
        ),
    ]
