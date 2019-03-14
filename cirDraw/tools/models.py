# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
import uuid


class ToolsChromosome(models.Model):
    caseid = models.ForeignKey('ToolsUploadcase', models.DO_NOTHING, blank=True, null=True)
    chr_ci = models.CharField(max_length=50)
    chr_start = models.IntegerField()
    chr_end = models.IntegerField()
    max_length_circ = models.IntegerField()
    min_length_circ = models.IntegerField()

    class Meta:
        db_table = 'tools_chromosome'

class ToolsScalegenome(models.Model):
    species = models.CharField(max_length=300)
    chr_ci = models.CharField(max_length=30)
    gene_min_start = models.IntegerField()
    gene_max_end = models.IntegerField()
    genelens_wiki = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tools_scalegenome'


class ToolsAnnotation(models.Model):
    gene_type = models.CharField(max_length=50)
    gene_name = models.CharField(max_length=200)
    chr_ci = models.CharField(max_length=50)
    gene_start = models.IntegerField()
    gene_end = models.IntegerField()
    gene_id = models.CharField(max_length=200, primary_key=True)
    species = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'tools_annotation'


class ToolsEachobservation(models.Model):
    circRNA_ID = models.CharField(db_column='circRNA_ID', primary_key=True, max_length=200)  # Field name made lowercase.
    chr_ci = models.CharField(max_length=40, blank=True, null=True)
    circRNA_start = models.IntegerField(db_column='circRNA_start', blank=True, null=True)  # Field name made lowercase.
    circRNA_end = models.IntegerField(db_column='circRNA_end', blank=True, null=True)  # Field name made lowercase.
    SM_MS_SMS = models.CharField(db_column='SM_MS_SMS', max_length=40, blank=True, null=True)  # Field name made lowercase.
    junction_reads = models.IntegerField(blank=True, null=True)
    non_junction_reads = models.IntegerField(blank=True, null=True)
    junction_reads_ratio = models.FloatField(blank=True, null=True)
    circRNA_type = models.CharField(db_column='circRNA_type', max_length=40, blank=True, null=True)  # Field name made lowercase.
    gene_id = models.CharField(max_length=100, blank=True, null=True)
    strand = models.CharField(max_length=100, blank=True, null=True)
    junction_reads_id = models.CharField(db_column='junction_reads_ID', max_length=500, blank=True, null=True)  # Field name made lowercase.
    caseid = models.ForeignKey('ToolsUploadcase', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        db_table = 'tools_eachobservation'


class ToolsUploadcase(models.Model):
    whichcase = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        db_table = 'tools_uploadcase'


class UploadParametersMD5(models.Model):
    md5 = models.CharField(db_column="MD5", max_length = 32, primary_key = True)
    status = models.BooleanField(db_column="Status", default = False)
    file_type = models.CharField(db_column="FileType", max_length = 100)
    path = models.CharField(db_column="path", max_length=200)
    species = models.CharField(db_column="Species", max_length = 400)
    denvalue = models.IntegerField(db_column = "denvalue")
    time = models.FloatField(db_column = "time_created")


    class Meta:
        db_table = 'tools_uploadmd5'

