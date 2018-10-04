from django.shortcuts import render
from django.http import Http404, HttpResponse, JsonResponse
from . forms import UploadFileForm
from . models import uploadCase, eachObservation
from . process_file import handle_uploaded_file
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Max, Min
from django.test import Client
# Create your views here.


"""
what should be included in this view.py??

>1) render_index_page -> HttpResponse of the index.html
>2) upload and save :
    >handle uploaded file and sink it to database;
    >get back the case_id and attach it to the url;
    >attach the overlap rate to url;
>3) get_density_data:
        >read_window_url->get_caseid & overlap rate;
        >request_data_with_caseid and overlap_rate;
        >compute density and return [{‘chr’: 1, ‘start’: 20, ‘end’: 50, ‘density’: 30}...]
>4) render_gene_info(chromesome);
    updata the corresponding column in

>5) draw(request[caseid, chromesome, start/end]) -> return [{'start': 0, 'end':200}...]
>6) view(request[caseid, chrome, whichgene(start, end)]) -> return [{'start': 0, 'end':200}...]
"""

# ----------------render index view-----------------------
def render_index_page(request):
    context = {}
    return render(request, 'tools/index.html', context)


# ----------------upload & save & get_caseid--------------------
def upload_handle(request):
    """
    main function in this section. handle data-save_to_database-getid-jump_to_display_page
    will call:
        process_upload(request) -> [{object_circ}...];
        save_to_db() -> None:
            get_caseid() -> str;
        render_display(caseid)
    """
    results = process_upload(request)
    caseid = save(results)
    return render_display(caseid)


def process_upload(request):
    """handle upload file and return [{}..]
    Cooresponding test: test_process_upload() in test.py
    """
    if request.method == "POST":
        form = UploadFileForm(request.POST, request.FILES)
            if form.is_valid():
            data_raw_file = request.FILES['my-file-selector']
            header, result = handle_uploaded_file(data_raw_file)
            return result
        else:
            print('upload file form is not valid')
    else:
        print('request of upload is not POST')

def save(results):
    """save the result data to database
    """









# -----------------



































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





