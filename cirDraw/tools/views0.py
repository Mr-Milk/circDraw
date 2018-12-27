from django.shortcuts import render, redirect
from django.http import Http404, HttpResponse, JsonResponse
from .forms import UploadFileForm
from .models import ToolsUploadcase, ToolsEachobservation, ToolsAnnotation, ToolsChromosome, ToolsScalegenome
from .process_file import handle_uploaded_file
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Max, Min
from django.test import Client
from scipy.stats import norm
from sklearn.neighbors import KernelDensity
import numpy as np
from math import floor
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
    context = {'caseid':'b87f7317-d42b-4ee7-bed0-76873d9fd41b'}
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
    filename = 'myfile'
    header, results, file_type, species = process_upload(request, filename)
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
            file_type = detect_filetype(data_raw_file)
            species = detect_species(data_raw_file)
            return header, result, file_type, species
        else:
            print('upload file form is not valid')
            raise Http404
    else:
        print('request of upload is not POST')
        raise Http404



def save(header, results, file_type, species):
    """
    >>> header = ['circRNA_ID', 'chr_ci', 'circRNA_start', 'circRNA_end']
    >>> results = [{'chr_ci': 'KI270792.1', 'circRNA_ID': 'KI270792.1:75980|83617','circRNA_end': '83617', 'circRNA_start': '75980'}, {'chr_ci': 'KI270850.1','circRNA_ID': 'KI270850.1:171308|171975','circRNA_end': '171975','circRNA_start': '171308'}]
    """
    case = ToolsUploadcase()
    caseid = case.whichcase
    case.save()
    chromosome_info = [[3492307800,0] for _ in range(25)] ## ! WARNING this number is designed to be unreachable by any gene_start point of human, careful when change the species.
    def get_start_point(lst):
        """get the start point of [xxx, xxx]"""
        return lst[0]
    def get_end_point(lst):
        return lst[1]
    def update_chromosome_start(lst, update_to):
        lst[0] = update_to
    def update_chromosome_end(lst, update_to):
        lst[1] = update_to

    chr_order = 0
    for e in results:
        # save each observation
        ob = ToolsEachobservation(caseid = case)
        assert type(header) == list, "HEADER passed in to save is not a list"
        for each in header:
            exec('ob.' + each +' = ' + 'e["' + each +'"]', globals(), locals())
        ob.save()

        # update chromosome info
        now_chr = e['chr_ci']
        chr_num = get_chr_num(now_chr)
        now_start = int(e['circRNA_start'])
        now_end = int(e['circRNA_end'])
        if chr_num >= 0:
            if now_start < get_start_point(chromosome_info[chr_num-1]):
                update_chromosome_start(chromosome_info[chr_num-1],now_start)
            if now_end > get_end_point(chromosome_info[chr_num - 1]):
                update_chromosome_end(chromosome_info[chr_num-1], now_end)
        else:
            print("one of Your input of chr from the handle file is crap")
    for i,each_chr in enumerate(chromosome_info):
        if get_start_point(each_chr) < get_end_point(each_chr):
            ob_chr = ToolsChromosome(caseid = case, chr_ci = toCHR(i+1),chr_start = get_start_point(each_chr), chr_end = get_end_point(each_chr))
            ob_chr.save()
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
        chr_ci = toCHR(int(request.GET['chr']))
        scale_start = int(request.GET['start'])
        scale_end = int(request.GET['end'])
        chr_max_min = ToolsChromosome.objects.filter(caseid__exact=case_id).get(chr_ci__exact=chr_ci)
        max_end, min_start = chr_max_min.chr_end, chr_max_min.chr_start
        # descaling the start and end
        start = descaling(scale_start, max_end, min_start, 400)
        end = descaling(scale_end, max_end, min_start, 400)
        print(start, end)
        obs = ToolsEachobservation.objects.filter(caseid__exact=case_id).filter(chr_ci__exact=chr_ci).filter(circRNA_start__gt=start).filter(circRNA_end__lt=end)
        print(len(obs))
        # max_end, min_start = obs.aggregate(Max('circRNA_end'))['circRNA_end__max'], obs.aggregate(Min('circRNA_start'))['circRNA_start__min']

        results = []
        for ob in obs[:1]:
            result_draw = {
                #'start': scaling(ob.circRNA_start, max_end, min_start, 400),
                #'end': scaling(ob.circRNA_end, max_end, min_start, 400),
                'start': 0,
                'end': 400,
                'obid': ob.pk,
            }
            results.append(result_draw)
        return JsonResponse(results, safe=False)
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
        obs = ToolsChromosome.objects.filter(caseid__exact=caseid)
        gene_lens = []
        # which chr is involoed:
        chr_inv = [i.chr_ci for i in obs]
        max_len = 0
        for i in chr_inv:
            gene_ob = ToolsScalegenome.objects.filter(species__exact="human").filter(chr_ci__exact=i)[0]
            lens = gene_ob.gene_max_end - gene_ob.gene_min_start
            if lens > max_len:
                max_len = lens
            gene_lens.append({'chr':i, 'chrLen': lens})
        # update scale
        for i in gene_lens:
            i['chrLen'] = (i['chrLen'] / max_len) * 400
        return JsonResponse(gene_lens, safe=False)
    else:
        print("your request method for file4 is not get")
        raise Http404

def chr_lengths(queryset):
    chr_lens = []
    max_len = 0
    for i in queryset:
        length = i.chr_end - i.chr_start
        if max_len < length:
            max_len = length
        chr_len = {'chr': i.chr_ci, 'chrLen': length}
        chr_lens.append(chr_len)
    return (max_len, chr_lens)


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
        #####################################
        ####### get basic information #######
        #####################################

        # create circRNA and gene group based on chr
        data_groups = [[] for _ in range(2)]
        results = []
        # chr exist in the uploaded file
        chr_exist = ToolsChromosome.objects.filter(caseid_id__exact=caseid)
        chrs = [get_chr_num(r.chr_ci)-1 for r in chr_exist]
        results = [{'chrnum': len(chrs)}]
        # max in gene:
        max_gene_len = 0
        for gg in chr_exist:
            gene_ob = ToolsScalegenome.objects.filter(species__exact="human").filter(chr_ci__exact=gg.chr_ci)[0]
            lens = gene_ob.gene_max_end - gene_ob.gene_min_start
            if lens > max_gene_len:
                max_gene_len = lens
        # pixels
        pixels = 800
        max_chr_lens, chr_lens = chr_lengths(chr_exist)
        # create pixels
        pixel_num = 1000
        x_d = np.linspace(0, 400, pixel_num)

        # create gene_box
        gene_box = []
        ##########################
        ########## loop ##########
        ##########################
        for i in chr_lens:
            # get current chr length
            chr_num_now = get_chr_num(i['chr']) - 1
            chr_len_now = i['chrLen']
            # static info
            densitys = 0
            chr_results = []
            density_box = [] # list to contain the pixels appeared
            chr_ccc = toCHR(chr_num_now + 1)
            data_groups[0] = ToolsEachobservation.objects.filter(caseid_id__exact=caseid).filter(chr_ci__exact=chr_ccc)
            data_groups[1] = ToolsAnnotation.objects.filter(gene_type__exact="gene").filter(chr_ci__exact=chr_ccc)
            gene_se = ToolsScalegenome.objects.filter(species__exact="human").filter(chr_ci__exact=chr_ccc)
            min_gene_start, max_gene_end = gene_se[0].gene_min_start, gene_se[0].gene_max_end
            gene_chr_lens = max_gene_end - min_gene_start

            # we want to divide the group so that the loop's runtime will be reduced.

            # start the loop
            for each in data_groups[1]:
                start, end = each.gene_start, each.gene_end
                # THE ACTUAL loop
                count = 0
                for r in data_groups[0]:
                    if circ_isin(each, r):
                        count += 1
                if count != 0:
                    ret = {'chr': chr_num_now, 'start': start, 'end': end, 'density': count}
                    # figure out which group we are in:
                    start_p, end_p = (start - min_gene_start) / (max_gene_end - min_gene_start), (end - min_gene_start) / (max_gene_end - min_gene_start)
                    start_pixel, end_pixel = floor(start_p * pixel_num), floor(end_p * pixel_num)

                    # assure start and end is not the same:
                    if start_pixel == end_pixel and end_pixel < pixel_num:
                        end_pixel += 1

                    # add count to covered pixels:
                    for e in range(start_pixel, end_pixel):
                        density_box.append(e)

                    # record total density
                    densitys += count

                    # retrieve the gene information from annotion
                    """
                    gene_chromosome = each.chr_ci
                    gene_species = each.species
                    gene_name = each.gene_name
                    gene_id = each.gene_id
                    gene_type = each.gene_type
                    gene_start = start
                    gene_end = end
                    gene_density = count
                    gene = {'chromosome': gene_chromosome, 'speices': gene_species, 'name':gene_name, 'type': gene_type, 'density':gene_density, 'start': gene_start, 'end': gene_end}
                    gene_box.append(gene)


            # calculate density
            for i in gene_box:
                i['density'] = i['density'] / densitys
            """

            # implement KDE for estimate the real distribution

            x = np.array(density_box)
            # instantiate and fit the KDE model
            kde = KernelDensity(bandwidth=1.0, kernel='gaussian')
            kde.fit(x[:,None])
            # score_samples returns the log of the probability density
            prob = np.exp(kde.score_samples(x_d[:, None]))
            track = 0

            for ee in prob:

                ## convert to standard format and deliver:
                number = track + 1
                pixel_scale_start = (number / pixel_num) * 400 * (gene_chr_lens / max_gene_len)
                number += 1
                pixel_scale_end = (number / pixel_num) * 400 * (gene_chr_lens / max_gene_len)
                pix = {'chr': chr_num_now + 1, 'start': pixel_scale_start, 'end': pixel_scale_end, 'density': round(ee*1000)}
                track += 1
                results.append(pix)



            print("---------------------------")


        """
        # fake data:
        results = [{'chr': 22, 'start': 1, 'end': 4, 'density': 20}, {'chr': 1, 'start': 30, 'end': 56, 'density': 61}]
        """
        for res in results[1:]:
            print(res)
        print("file5 has been handled with lens of returning list: ",len(results))

        ######################################
        ########## convert to pixel block ####
        #####################################


        #final_out = [results, gene_box]
        print('check gene_box', gene_box[:20])

        return JsonResponse(results, safe=False)


    chr_colors = []
    for r in range(chr_pixels):
        dic = {'chr': i+1, 'start': r/2, 'end': (1+r)/2, 'density': 0}
        chr_colors.append(dic)


def get_chr_num(chr_ci):
    if chr_ci[:3] != "chr":
        return -1
    else:
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


