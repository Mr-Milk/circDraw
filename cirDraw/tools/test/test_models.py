from django.test import TestCase
import unittest
from tools.models import
# Create your tests here.
gene_info_ob = {}

def create_annotation_object(gene_info_ob):
    return ToolsAnnotation.objects.create(gene_type=gene['gene_type'], gene_name=gene['gene_name'], chr_ci=gene['chr_ci'], gene_start=gene['gene_start'], gene_end=geen['gene_end'], gene_id=gene['gene_id'])


class UploadcaseTest(TestCase):
    @classmethod

    def test_uploadcase(self):
"""
class ToolsAnnotation(models.Model):
    gene_type = models.CharField(max_length=50)
    gene_name = models.CharField(max_length=200)
    chr_ci = models.CharField(max_length=50)
    gene_start = models.IntegerField()
    gene_end = models.IntegerField()
    gene_id = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'tools_annotation'


class ToolsEachobservation(models.Model):
    circrna_id = models.CharField(db_column='circRNA_ID', primary_key=True, max_length=200)  # Field name made lowercase.
    chr_ci = models.CharField(max_length=40, blank=True, null=True)
    circrna_start = models.IntegerField(db_column='circRNA_start', blank=True, null=True)  # Field name made lowercase.
    circrna_end = models.IntegerField(db_column='circRNA_end', blank=True, null=True)  # Field name made lowercase.
    sm_ms_sms = models.CharField(db_column='SM_MS_SMS', max_length=40, blank=True, null=True)  # Field name made lowercase.
    junction_reads = models.IntegerField(blank=True, null=True)
    non_junction_reads = models.IntegerField(blank=True, null=True)
    junction_reads_ratio = models.FloatField(blank=True, null=True)
    circrna_type = models.CharField(db_column='circRNA_type', max_length=40, blank=True, null=True)  # Field name made lowercase.
    gene_id = models.CharField(max_length=100, blank=True, null=True)
    strand = models.CharField(max_length=100, blank=True, null=True)
    junction_reads_id = models.CharField(db_column='junction_reads_ID', max_length=500, blank=True, null=True)  # Field name made lowercase.
    caseid = models.ForeignKey('ToolsUploadcase', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tools_eachobservation'


class ToolsUploadcase(models.Model):
    whichcase = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        managed = False
        db_table = 'tools_uploadcase'


"""
