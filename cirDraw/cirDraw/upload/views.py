#from django.template import loader
from django.shortcuts import render
from .models import eachObservation, uploadCase
import datetime
from .forms import UploadFileForm
from .process_file import handle_uploaded_file
from django.views.decorators.csrf import csrf_exempt
from django.http import Http404, HttpResponse, JsonResponse




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

	case = "no case"

	if request.method == "POST":
		form = UploadFileForm(request.POST, request.FILES)
		#if form.is_valid():
		data_raw_file = request.FILES['myfile']
		header, result = handle_uploaded_file(data_raw_file)

		# sink into database:
		# HOw to sink to the database:
		# import from models.py make instance and f.save()

		case = uploadCase()
		case.save()

		context = {'result': result, 'header': result[0], 'caseid': "Nothing"}

		if True:
			for e in result:
				ob = eachObservation(caseid = case)
				for each in header.lst:
					exec('ob.' + each +' = ' + 'e["' + each +'"]', globals(), locals())
				ob.save()




				obs = eachObservation.objects.all()
				context = {'result': obs, 'header': header, 'caseid': "obtain data"}


		# test outside saving the result
		else: 
			obs = eachObservation.objects.filter(chr_ci = 'chr1')
			context = {'result': obs, 'header': header, 'caseid': case.case_id}

	return render(request, 'upload/results.html', context)


@csrf_exempt 
def save(request):
	if request.method == "POST" and request.FILES['myfile']:
		form = UploadFileForm(request.POST, request.FILES)
		context = {}
		if True:
			data_raw_file = request.FILES['myfile']
			header, result = handle_uploaded_file(data_raw_file)
			context = {'result':result, 'header': header}
		return render(request, 'upload/results.html', context)
	else:
		raise Http404
		


