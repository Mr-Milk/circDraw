from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from . forms import UploadFileForm
from . models import uploadCase, eachObservation
from . process_file import handle_uploaded_file
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


def save(request):
	result = ["There is None."]
	if request.method == "POST":
		form = UploadFileForm(request.POST, request.FILES)
		data_raw_file = request.FILES['my-file-selector']
		header, results = handle_uploaded_file(data_raw_file)
		## modify the database
		case = uploadCase()
		case.save()
		for each in results:
			ob = eachObservation(caseid = case.id, circRNA_ID=each.circRNA_ID, chr_ci = each.chr, circRNA_start = each.circRNA_start, circRNA_end = circRNA_end, junction_reads = each.junction_reads, non_junction_reads = each.non_junction_reads, circRNA_type = each.circRNA_type, gene_id = each.gene_id)
			ob.save()
		return HttpResponse({ "caseid" : case.id })




