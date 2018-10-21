from django import forms

class UploadFileForm(forms.Form):
	myfile = forms.FileField()
