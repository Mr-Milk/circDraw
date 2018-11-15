from django.db import models

# Create your models here.

class Test1Chromosome(models.Model):
    chr_ci = models.CharField(max_length=50)
    chr_start = models.IntegerField()
    chr_end = models.IntegerField()

    class Meta:
        db_table = 'test1_chromosome'
