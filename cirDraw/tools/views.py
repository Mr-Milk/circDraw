from django.shortcuts import render, redirect
from django.http import Http404, HttpResponse, JsonResponse
from .forms import UploadFileForm
from .models import ToolsUploadcase, ToolsEachobservation, ToolsAnnotation
from .process_file import handle_uploaded_file
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

# ----------------render index and upload page -----------------------
def render_index_page(request):
    context = {}
    return render(request, 'tools/index.html', context)

def render_upload_page(request):
    """test_render_upload_page"""
    context = {}
    return render(request, 'tools/upload.html', context)

# ----------------upload & save & get_caseid--------------------
# test upload is fine
def upload_fine(request):
    filename = 'myfile'
    if request.method == "POST":
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            catch_file = request.FILES[filename]
            file_content = catch_file.readlines()
            context = {'output': file_content}
            return redirect('test_display')
        else:
            print('upload file form is not valid')
            context = {'output': "upload file form is not valid"}
            return render(request,'tools/page_test.html', context)
    else:
        print('request of upload is not POST')
        context = {'output': "request of upload is not POST"}
        return render(request,'tools/page_test.html', context)


# test display is connected
def display_fine(request):
    context = {'caseid':'ec04092365e64a8aa1fc6e1e9ff9822c'}
    return render(request, 'tools/tools.html', context)



#---------------
def upload_and_save(request):
    """
    main function in this section. handle data-save_to_database-getid-jump_to_display_page
    will call:
        process_upload(request) -> [{object_circ}...];
        save_to_db() -> None:
            get_caseid() -> str;
        render_display(caseid)
    """
    filename = 'file'
    header, results = process_upload(request, filename)
    caseid = save(header, results)
    return redirect('render_display', caseid=caseid)


def process_upload(request, filename):
    """handle upload file and return [{}..]
    >>> c = Client()
    """
    if request.method == "POST":
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            data_raw_file = request.FILES[filename]
            header, result = handle_uploaded_file(data_raw_file)
            return header, result
        else:
            print('upload file form is not valid')
            raise Http404
    else:
        print('request of upload is not POST')
        raise Http404



def save(header, results):
    """
    >>> header = ['circRNA_ID', 'chr_ci', 'circRNA_start', 'circRNA_end']
    >>> results = [{'chr_ci': 'KI270792.1', 'circRNA_ID': 'KI270792.1:75980|83617','circRNA_end': '83617', 'circRNA_start': '75980'}, {'chr_ci': 'KI270850.1','circRNA_ID': 'KI270850.1:171308|171975','circRNA_end': '171975','circRNA_start': '171308'}]
    >>> save(header, results)
    """
    case = ToolsUploadcase()
    caseid = case.whichcase
    case.save()
    for e in results:
        ob = ToolsEachobservation(caseid = case)
        assert type(header) == list, "HEADER passed in to save is not a list"
        for each in header:
            exec('ob.' + each +' = ' + 'e["' + each +'"]', globals(), locals())
        ob.save()
    print(ob.caseid, ob.circRNA_ID)
    return caseid

# --------------------------------------------------------------
# ---------------------render display page --------------------
def render_display_page(request, caseid):
    context = {"caseid":caseid}
    return render(request, 'tools/tools.html', context)

# ---------------------get_chr_scale-------------------------------
def get_scale_se(model_name, chr_ci, start_name, end_name):
    """get star and end position of input chr"""
    obs = model_name.objects.filter(chr_ci__exact=chr_ci)
    max_ = obs.aggregate(Max(str(end_name)))[(end_name+'__max')]
    min_ = obs.aggregate(Min(str(start_name)))[(start_name + '__min')]
    if max_ is None:
        max_ = 0
    if min_ is None:
        min_ = 0
    return max_, min_

# ---------------------handle_file1---------------------------------------
@csrf_exempt
def handle_file1(request):
    if request.method == 'GET':
        case_id = request.GET['case_id']
        chr_ci = request.GET['chr']
        start = request.GET['start']
        end = request.GET['end']
        obs = ToolsEachobservation.objects.filter(caseid__exact=case_id).filter(chr_ci__exact=chr_ci).filter(circRNA_start__gt=start).filter(circRNA_end__lt=end)
        #max_end, min_start = obs.aggregate(Max('circRNA_end'))['circRNA_end__max'], obs.aggregate(Min('circRNA_start'))['circRNA_start__min']
        max_end, min_start = get_scale_se(ToolsAnnotation, chr_ci, 'circRNA_start', 'circRNA_end')
        results = []
        for ob in obs:
            result_draw = {
                'start': scaling(ob.circRNA_start, max_end, min_start, 400),
                'end': scaling(ob.circRNA_end, max_end, min_start, 400),
                'obid': ob.pk,
            }
            results.append(result_Draw)
        return JsonResponse(results)
    else:
        print("your request for file1 is not get")
        raise Http404

# ------------------------handle_flie2---------------------------------
def handle_file2(request):
    if request.method == 'GET':
        case_id = request.GET['case_id']
        chr_ci = request.GET['chr']
        start = int(request.GET['start'])
        end = int(request.GET['end'])
        obs = ToolsAnnotation.objects.filter(chr_ci__exact=chr_ci).filter(gene_start__gt=start).filter(gene_end__lt=end)
        max_end, min_start = get_scale_se(ToolsAnnotation, chr_ci, 'gene_start', 'gene_end')
        results = []
        for ob in obs:
            result = {
                    'name': ob.gene_name,
                    'start': scaling(ob.gene_start, max_end, min_start, 400),
                    'end': scaling(ob.gene_end, max_end, min_start, 400),
                    'geneid': ob.gene_id
                    }
            results.append(result)
        return JsonResponse(results)
    else:
        print("your request for file2 is not get")
        raise Http404
# --------------------handle_file_3------------------------------
def handle_file3(request):
    if request.method == 'GET':
        chr_ci = request.GET['chr']
        start = int(request.GET['start'])
        end = int(request.GET['end'])
        max_end, min_start = get_scale_se(ToolsAnnotation, chr_ci, 'gene_start', 'gene_end')
        real_start = descaling(start, max_end, min_start, 400)
        real_end = descaling(end, max_end, min_start, 400)
        result = {'realStart': real_start, 'realEnd': real_end}
        return JsonResponse(result)
    else:
        print("your request method for file3 is not get")
        raise Http404
# -------------------handle_file_4------------------------------
def handle_file4(request):
    if request.method == 'GET':
        caseid = request.GET['case_id']
        obs = ToolsEachobservation.objects.filter(caseid__exact=caseid).values('chr_ci').distinct()
        print([i['chr_ci'] for i in obs])
        chr_lens = []
        max_len = 0
        for ob in obs:
            chr_ci = ob['chr_ci']
            model_name = ToolsAnnotation
            start_name, end_name = 'gene_start', 'gene_end'
            print(model_name, chr_ci,start_name, end_name)
            max_end, min_start = get_scale_se(model_name, chr_ci, start_name, end_name)
            length = max_end - min_start
            if length > max_len:
                max_len = length
            if length != 0:
                chr_len = {'chr': chr_ci, 'chrLen': length}
                chr_lens.append(chr_len)
        for i in chr_lens:
            i['chrLen'] = scaling(i['chrLen'], max_len, 0, 400)
        print(chr_lens)
        return JsonResponse(chr_lens, safe=False)
    else:
        print("your request method for file4 is not get")
        raise Http404

# -------------handle_file5----------------------------------

def toCHR(num):
    """convert a number to a chr string"""
    assert type(num) == int, "Wrong input in toCHR"
    if num == 23:
        c_num = "X"
    elif num == 24:
        c_num = "Y"
    elif num == 25:
        c_num = "M"
    else:
        c_num = str(num)
    return "chr" + c_num

def handle_file5(request):
    if request.method == "GET":
        caseid = request.GET['case_id']
        circobs = ToolsEachobservation.objects.filter(caseid_id__exact=caseid)
        print("OK: ",len(circobs))
        # create circRNA and gene group based on chr
        data_groups = [[] for _ in range(2)]
        results = []
        densitys = 0
        for i in range(25):
            chr_ccc = toCHR(i+1)
            data_groups[0] = ToolsEachobservation.objects.filter(caseid_id__exact=caseid).filter(chr_ci__exact=chr_ccc)
            data_groups[1] = ToolsAnnotation.objects.filter(gene_type__exact="gene").filter(chr_ci__exact=chr_ccc)
            #print("OK: ",len(data_groups[0]))
            for each in data_groups[1]:
                start, end = each.gene_start, each.gene_end
                count = 0
                for r in data_groups[0]:
                    if circ_isin(each, r):
                        #print("I'm counted")
                        count += 1
                       # print(count)
                #print("the count for this gene is ",count)
                if count != 0:
                    ret = {'chr': i, 'start': start, 'end': end, 'density': count}
                #print("count:{0}".format(count))
                    densitys += count
                    results.append(ret)

            #print("finish chr {} and count is {}".format(i,densitys))

        for i in results:
            i['density'] = (i['density'] / densitys)
        for res in results:
            print(res)
        print("file5 has been handled with lens of returning list: ",len(results))

        return JsonResponse(results,safe=False)

def get_chr_num(chr_ci):
    c = chr_ci.lower()[3:]
    try:
        return int(c)
    except ValueError:
        if c.lower() == 'x':
            return 23
        elif c.lower() == 'y':
            return 24
        else:
            raise ValueError

def circ_isin(geneob, circob, overlap_rate=0.5):
    """define how to be counted as in the gene"""
    gene_len = geneob.gene_end - geneob.gene_start
    circ_len = circob.circRNA_end - circob.circRNA_start
    if circob.circRNA_start > geneob.gene_end or circob.circRNA_end < geneob.gene_start:
        return False
    else:
        lst = [geneob.gene_start, geneob.gene_end, circob.circRNA_start, circob.circRNA_end]
        sort_lst = sorted(lst)
        #print(sort_lst)
        over = sort_lst[2] - sort_lst[1]
        #print(sort_lst, over, gene_len, over/gene_len)
        #print(over >= (gene_len * overlap_rate))
        if over >= (gene_len * overlap_rate):
            return True
        else:
            return False










# ------------------------------------------------------------------
def chrstartend(request):
    """
    A view function which return the start and end info of the chr in the upload case.
    """
    if request.method == 'GET':
        case_id = request.GET['case_id']
        chr_ci = request.GET['chr']
        start = request.GET['start']
        end = request.GET['end']
        obs = ToolsEachobservation.objects.filter(caseid__exact=case_id).filter(chr_ci__exact=chr_ci)
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
    ToolsEachobservation()
    context = {'searchwhat': searchwhat}
    return render(request, 'upload/results.html', context)





def scaling(point, max_end, min_start, scale, default_start=0):
    """scale a point to 0-400"""
    assert point <= max_end, 'Invalid scaling input'
    if type(scale) == int:
        scale = (default_start, scale)
    return scale[0] + (point - min_start) / (max_end - min_start) * (scale[1] - scale[0])




def descaling(spoint, max_end, min_start, scale, default_start=0):
    if type(scale) == int:
        scale = (default_start, scale)
    assert spoint >= scale[0] and spoint <= scale[1], 'Wrong descaling input'
    return min_start + (spoint - scale[0]) / (scale[1] - scale[0]) * (max_end - min_start)


