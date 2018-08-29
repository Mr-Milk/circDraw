#from django.template import loader
from django.shortcuts import render
from .models import CIRIdata, eachObservation
import datetime
from .forms import UploadFileForm
from .process_file import handle_uploaded_file


def index(request):
	all_data = eachObservation.objects.all()
	#template = loader.get_template('upload/index.html')
	context = {
		'all_data': all_data,
	}
	#return HttpResponse(template.render(context, request))
	return render(request, 'upload/index.html', context)

def current_datetime(request):
	now = datetime.datetime.now()
	html = "<html><body>It is now %s.</body></html>" % now 
	return HttpResponse(html)

def results(request):
	#all_data = eachObservation.objects.all()
	searchwhat = request.GET['q']
	context = {
		'searchwhat': searchwhat
	}
	return render(request, 'upload/results.html', context)

def display(request):
	result = ["There is None."]
	if request.method == "POST":
		form = UploadFileForm(request.POST, request.FILES)
		#if form.is_valid():
		data_raw_file = request.FILES['upload_file']
		header, result = handle_uploaded_file(data_raw_file)
	context = {'result': result, 'header': header,}
	return render(request, 'upload/results.html', context)



