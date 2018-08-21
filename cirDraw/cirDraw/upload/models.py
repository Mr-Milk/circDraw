from django.db import models

# Create your models here.
class CIRIdata(models.Model):
	rawfile = models.FileField(null=True, blank=True)

class eachObservation(models.Model):
	circRNA_ID = models.CharField(max_length=100)
	chr_ci = models.CharField(max_length=40)
	circRNA_start = models.IntegerField()
	circRNA_end = models.IntegerField()
	junction_reads = models.IntegerField()
	non_junction_reads = models.IntegerField()
	circRNA_type = models.CharField(max_length=100)
	gene_id = models.CharField(max_length=100)

	def __str__(self):
		return 'rawdataobject-' + str(self.circRNA_start) + '->' + str(self.circRNA_end)
