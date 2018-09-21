from django.shortcuts import render
from django.http import Http404, HttpResponse, JsonResponse
from . forms import UploadFileForm
from . models import uploadCase, eachObservation
from . process_file import handle_uploaded_file
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Max, Min
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

		for e in result:
			ob = eachObservation(caseid = case)
			for each in header.lst:
				exec('ob.' + each +' = ' + 'e["' + each +'"]', globals(), locals())
			ob.save()



		# plan to change to manager system for query the database!
		#obs = eachObservation.objects.filter(caseid__exact=case.whichcase).filter(circRNA_start__gt=10000).filter(circRNA_end__lt=20000)
		# # test outside saving the result
		# else: 
		# 	obs = eachObservation.objects.filter(chr_ci = 'chr1')
		# 	context = {'result': obs, 'header': header, 'caseid': "not obtain data"}

	return JsonResponse({'caseid': case.whichcase})

@csrf_exempt 
# file_
def lenChart(request):
	if request.method == 'GET':
		case_id = request.GET['caseid']
		chr_ci = request.GET['chr']
		start = request.GET['start']
		end = request.GET['end']
		obs = eachObservation.objects.filter(caseid__exact=case_id).filter(circRNA_start__gt=start).filter(circRNA_end__lt=end)
		max_end, min_start = obs.aggregate(Max('circRNA_end'))['circRNA_end__max'], obs.aggregate(Min('circRNA_start'))['circRNA_start__min']

		def scaling(point, max_end, min_start, scale):
			return (point - min_start) / (max_end - min_start) * scale

		results = []
		for ob in obs:
			result_lenDraw = {
				'start': scaling(ob.circRNA_start, max_end, min_start, 400),
				'end': scaling(ob.circRNA_end, max_end, min_start, 400),
				'obid': ob.pk,
			} 
			results.append(result_lenDraw)

		return JsonResponse({'lenChart_data': results})
	else:
		raise Http404


def exonChart(request):
	if request.method == 'GET':
		pass
	else:
		raise Http404












# def save(request):
# 	if request.is_ajax() and request.method == "POST":
# 		result = ["There is None."]
# 		form = UploadFileForm(request.POST, request.FILES)
# 		if form.is_valid():
# 			data_raw_file = request.FILES['my-file-selector']
# 			header, results = handle_uploaded_file(data_raw_file)
# 			case = uploadCase()
# 			case.save()
# 			for each in results:
# 				ob = eachObservation(caseid = case.id, circRNA_ID=each.circRNA_ID, chr_ci = each.chr, circRNA_start = each.circRNA_start, circRNA_end = circRNA_end, junction_reads = each.junction_reads, non_junction_reads = each.non_junction_reads, circRNA_type = each.circRNA_type, gene_id = each.gene_id)
# 				ob.save()
# 			return JsonResponse({ "caseid" : case.id })
# 	else:
# 		raise Http404


def results(request):
	#all_data = eachObservation.objects.all()
	caseid = request.GET['']
	eachObservation()
	context = {'searchwhat': searchwhat}
	return render(request, 'upload/results.html', context)





