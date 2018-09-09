from django.shortcuts import render
from django.http import Http404, HttpResponse, JsonResponse
from . forms import UploadFileForm
from . models import uploadCase, eachObservation
from . process_file import handle_uploaded_file
from django.views.decorators.csrf import csrf_exempt
# Create your views here.


def index(request):
	context = {}
	return render(request, 'tools/index.html', context)

def tools(request):
	context = {}
	return render(request, 'tools/tools.html', context)


def display(request):
	result = ["There is None."]
	if request.method == "POST":
		form = UploadFileForm(request.POST, request.FILES)
		#if form.is_valid():
		data_raw_file = request.FILES['my-file-selector']
		header, result = handle_uploaded_file(data_raw_file)
	context = {}
	return render(request, 'tools/tools.html', context)

@csrf_exempt 
def save(request):
	if request.is_ajax() and request.method == "POST":
		result = ["There is None."]
		form = UploadFileForm(request.POST, request.FILES)
		if form.is_valid():
			data_raw_file = request.FILES['my-file-selector']
			header, results = handle_uploaded_file(data_raw_file)
			case = uploadCase()
			case.save()
			for each in results:
				ob = eachObservation(caseid = case.id, circRNA_ID=each.circRNA_ID, chr_ci = each.chr, circRNA_start = each.circRNA_start, circRNA_end = circRNA_end, junction_reads = each.junction_reads, non_junction_reads = each.non_junction_reads, circRNA_type = each.circRNA_type, gene_id = each.gene_id)
				ob.save()
			return JsonResponse({ "caseid" : case.id })
	else:
		raise Http404


def results(request):
	#all_data = eachObservation.objects.all()
	caseid = request.GET['']
	eachObservation()
	context = {'searchwhat': searchwhat}
	return render(request, 'upload/results.html', context)





