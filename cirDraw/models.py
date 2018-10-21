# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=80)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class GeneAnnotation(models.Model):
    chr_ci = models.CharField(max_length=50)
    species = models.CharField(max_length=50)
    gene_name = models.CharField(max_length=100)
    gene_id = models.CharField(max_length=200)
    gene_type = models.CharField(max_length=100)
    gene_start = models.IntegerField()
    gene_end = models.IntegerField()
    density = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'gene_annotation'


class SpeciesHuman(models.Model):
    chr_ci = models.CharField(max_length=50)
    gene_start = models.IntegerField()
    gene_end = models.IntegerField()
    gene_id = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'species_human'


class ToolsAnnotation(models.Model):
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
    whichcase = models.CharField(primary_key=True, max_length=32)

    class Meta:
        managed = False
        db_table = 'tools_uploadcase'


class UploadDocument(models.Model):
    description = models.CharField(max_length=255)
    document = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'upload_document'


class UploadEachobservation(models.Model):
    circrna_id = models.CharField(db_column='circRNA_ID', primary_key=True, max_length=200)  # Field name made lowercase.
    chr_ci = models.CharField(max_length=40, blank=True, null=True)
    circrna_start = models.IntegerField(db_column='circRNA_start', blank=True, null=True)  # Field name made lowercase.
    circrna_end = models.IntegerField(db_column='circRNA_end', blank=True, null=True)  # Field name made lowercase.
    junction_reads = models.IntegerField(blank=True, null=True)
    non_junction_reads = models.IntegerField(blank=True, null=True)
    circrna_type = models.CharField(db_column='circRNA_type', max_length=40, blank=True, null=True)  # Field name made lowercase.
    gene_id = models.CharField(max_length=100, blank=True, null=True)
    caseid = models.ForeignKey('UploadUploadcase', models.DO_NOTHING, blank=True, null=True)
    sm_ms_sms = models.CharField(db_column='SM_MS_SMS', max_length=40, blank=True, null=True)  # Field name made lowercase.
    junction_reads_id = models.CharField(db_column='junction_reads_ID', max_length=500, blank=True, null=True)  # Field name made lowercase.
    junction_reads_ratio = models.FloatField(blank=True, null=True)
    strand = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'upload_eachobservation'


class UploadUploadcase(models.Model):
    case_id = models.CharField(primary_key=True, max_length=32)

    class Meta:
        managed = False
        db_table = 'upload_uploadcase'
