from django.db import models
import uuid

# Create your models here.
class uploadCase(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	filetype = models.CharField(max_length=100, null=True)


class eachObservation(models.Model):
	caseid =  models.ForeignKey(uploadCase, on_delete=models.CASCADE)
	circRNA_ID = models.CharField(max_length=200, primary_key=True)
	chr_ci = models.CharField(max_length=40)
	circRNA_start = models.IntegerField()
	circRNA_end = models.IntegerField()
	junction_reads = models.IntegerField()
	non_junction_reads = models.IntegerField()
	circRNA_type = models.CharField(max_length=100)
	gene_id = models.CharField(max_length=100)

	def __str__(self):
		return 'rawdataobject-' + str(self.circRNA_start) + '->' + str(self.circRNA_end)
