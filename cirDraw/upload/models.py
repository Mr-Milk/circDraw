from django.db import models
import uuid

class Document(models.Model):
    description = models.CharField(max_length=255, blank=True)
    document = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)





# Create your models here.
class uploadCase(models.Model):
	whichcase = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	#filetype = models.CharField(max_length=100, null=True)

	def __str__(self):
		return "caseid-" + str(whichcase)



# class errorsss(models.Model):
# 	caseid =  models.ForeignKey(uploadCase, on_delete=models.CASCADE, null=True)
# 	header = models.CharField(max_length=200)
# 	data = 





class eachObservation(models.Model):
	caseid =  models.ForeignKey(uploadCase, on_delete=models.CASCADE, null=True)
	circRNA_ID = models.CharField(max_length=200, primary_key=True)
	chr_ci = models.CharField(max_length=40, null=True, blank=True)
	circRNA_start = models.IntegerField(null=True, blank=True)
	circRNA_end = models.IntegerField(null=True, blank=True)
	SM_MS_SMS = models.CharField(max_length=40, null=True)
	junction_reads = models.IntegerField(null=True, blank=True)
	non_junction_reads = models.IntegerField(null=True, blank=True)
	circRNA_type = models.CharField(max_length=100, null=True, blank=True)
	junction_reads_ratio = models.FloatField(null=True)
	circRNA_type = models.CharField(max_length=40, null=True, blank=True)
	gene_id = models.CharField(max_length=100, null=True, blank=True)
	strand = models.CharField(max_length=100, null=True)
	junction_reads_ID = models.CharField(max_length=500, null=True)



	def __str__(self):
		return 'rawdataobject-' + str(self.circRNA_start) + '->' + str(self.circRNA_end)
