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


def new_upload(request):
	if request.method == "POST":
		form = UploadFileForm(request.POST, request.FILES)
		#if form.is_valid():
		data_raw_file = request.FILES['file']
		header, result = handle_uploaded_file(data_raw_file)

		return JsonResponse({'result': [i['circRNA_start'] for i in result]})

def display(request):
	if request.method == "POST":
		form = UploadFileForm(request.POST, request.FILES)
		#if form.is_valid():
		data_raw_file = request.FILES['my-file-selector']
		header, result = handle_uploaded_file(data_raw_file)
		case = uploadCase()
		case.save()
		for e in result:
			ob = eachObservation(caseid = case)
			for each in header.lst:
				exec('ob.' + each +' = ' + 'e["' + each +'"]', globals(), locals())
			ob.save()

	context = {'results': result, 'header': header, 'caseid':case.whichcase}
	return render(request, 'tools/results.html', context)


def save(request):
	if request.method == "POST":
		form = UploadFileForm(request.POST, request.FILES)
		data_raw_file = request.FILES["file"]
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
	else:
		raise Http404









def scaling(point, max_end, min_start, scale):
	assert point <= max_end, 'Invalid scaling input'
	return scale[0] + (point - min_start) / (max_end - min_start) * (scale[1] - scale[0])



def descaling(spoint, max_end, min_start, scale):
	assert spoint >= scale[0] and spoint <= scale[1], 'Wrong descaling input'
	return min_start + (spoint - scale[0]) / (scale[1] - scale[0]) * (max_end - min_start)



@csrf_exempt 
# file_
def draw(request):
	if request.method == 'GET':
		case_id = request.GET['caseid']
		chr_ci = request.GET['chr']
		start = request.GET['start']
		end = request.GET['end']
		obs = eachObservation.objects.filter(caseid__exact=case_id).filter(chr_ci__exact=chr_ci).filter(circRNA_start__gt=start).filter(circRNA_end__lt=end)
		max_end, min_start = obs.aggregate(Max('circRNA_end'))['circRNA_end__max'], obs.aggregate(Min('circRNA_start'))['circRNA_start__min']


		for ob in obs:
			result_draw = {
				'start': scaling(ob.circRNA_start, max_end, min_start, 400),
				'end': scaling(ob.circRNA_end, max_end, min_start, 400),
				'obid': ob.pk,
			} 
			results.append(result_Draw)


		return JsonResponse(results)
	else:
		raise Http404


def chrstartend(request):
	"""
	A view function which return the start and end info of the chr in the upload case.
	"""
	if request.method == 'GET':
		case_id = request.GET['caseid']
		chr_ci = request.GET['chr']
		start = request.GET['start']
		end = request.GET['end']
		obs = eachObservation.objects.filter(caseid__exact=case_id).filter(chr_ci__exact=chr_ci)
		return JsonResponse({'realStart': min_start, 'realEnd': max_en})
	else:
		raise Http404







def exonChart(request):
	if request.method == 'GET':
		pass
	else:
		raise Http404









def results(request):
	#all_data = eachObservation.objects.all()
	caseid = request.GET['']
	eachObservation()
	context = {'searchwhat': searchwhat}
	return render(request, 'upload/results.html', context)





