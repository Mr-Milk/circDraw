from django.shortcuts import render, redirect
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import Http404, HttpResponse, JsonResponse
from annoying.functions import get_object_or_None
from .forms import UploadFileForm, JsonTestFile
from .models import ToolsEachobservation, ToolsAnnotation, ToolsChromosome, ToolsScalegenome, UploadParametersMD5
from .process_file import handle_uploaded_file
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Max, Min
from sklearn.neighbors import KernelDensity
import numpy as np
from math import floor
import sys, datetime, time
import json
import hashlib

# ========================= RENDER PAGES ==============================
def render_index_page(request):
    context = {}
    return render(request, 'tools/index.html', context)

def render_upload_page(request):
    """test_render_upload_page"""
    context = {}
    return render(request, 'tools/upload.html', context)

def render_display_page(request, md5):
    context = {"md5": md5}
    return render(request, 'tools/tools.html', context)

# ======================== UPLOAD & SAVE ==============================

@csrf_exempt
def save_to_files(request):
    if request.method == "POST":
        form = UploadFileForm(data=request.POST, files=request.FILES)
        if form.is_valid():
            # get md5 value. Note: consider (file + parameters) as a whole md5
            form_file = form.cleaned_data['file']

            str_parameters = form.cleaned_data['parameters']

            parameters = json.loads(str_parameters)

            b_file = form_file.read()
            file_parameters = str_parameters.encode('utf-8') + b_file
            md5 = hashlib.md5(file_parameters).hexdigest()


            sub_base = "md5_data/"
            path = sub_base + md5

            # check if the file exists
            md5ob = get_object_or_None(UploadParametersMD5, md5=md5)
            print("Md5 existed in DB?: ", md5ob)

            if md5ob:
                print("existed in databse")
                time_ = md5ob.time
                return_json = [{'md5': md5, 'time': time_}]
                return JsonResponse(return_json, safe=False)
            if default_storage.exists(path):
                default_storage.delete(path)

            time_ = time.time()
            return_json = [{'md5': md5, 'time': time_}]

            # store md5 value and parameters into database
            path = default_storage.save(sub_base + md5, form_file) # note this path doesnot include the media root, e.g. it is actually stored in "media/data/xxxxxx"

            # distribute parameters details
            file_type = parameters['FileType']
            species = parameters['Species']
            denvalue = parameters['denvalue']


            # insert to data base the info of file, paramerter and time
            a = UploadParametersMD5(md5 = md5, status = 204, file_type = file_type, species = species, denvalue = denvalue, time = time_, path = path)
            md5ob = a
            a.save()


            # calling for process
            save_status = call_process(form_file, md5ob, parameters, toCHR, get_chr_num, circ_isin)
            if save_status == 200:
                ss_status = True
                a.status = 201
                a.save()

            else:
                ss_status = False
                a.status = 404
                a.save()

            return_json = [{'md5': md5, 'time': time_, 'save_status': ss_status}]



            return JsonResponse(return_json, safe=False)


def call_process(form_file, md5ob, parameters, toCHR, get_chr_num, circ_isin):
    """Function to control the file process precedure"""
    assert md5ob, "Md5 object should be valid"

    info_needed = ['circRNA_ID', 'chr', 'circRNA_start', 'circRNA_end']
    save_status = handle_uploaded_file(form_file, info_needed, md5ob, parameters, toCHR, get_chr_num, circ_isin)
    print("Saved?: {} {}".format(save_status, md5ob.md5))
    return save_status







def save(header, results, file_type, species):
    """Save file"""
    case = ToolsUploadcase()
    caseid = case.whichcase
    case.save()
    chromosome_info = [[[sys.maxsize, 0], [sys.maxsize, 0]] for _ in range(25)]
    max_length = 0

    def get_start_point(lst):
        """get the start point of [xxx, xxx]"""
        return lst[0][0]
    def get_end_point(lst):
        return lst[0][1]
    def get_max_len(lst):
        return lst[1][1]
    def get_min_len(lst):
        return lst[1][0]

    def update_chromosome_start(lst, update_to):
        lst[0][0] = update_to
    def update_chromosome_end(lst, update_to):
        lst[0][1] = update_to
    def update_circlen_max(lst, update_to):
        lst[1][1] = update_to
    def update_circlen_min(lst, update_to):
        lst[1][0] = update_to

    chr_order = 0
    for e in results:
        # save each observation
        ob = ToolsEachobservation(caseid = case)
        assert type(header) == list, "HEADER passed in to save is not a list"
        for each in header:
            exec('ob.' + each +' = ' + 'e["' + each +'"]', globals(), locals())
        ob.save()

        # update chromosome max end and min start
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

        # update max length of circle RNA
        length = now_end - now_start
        now_max = get_max_len(chromosome_info[chr_num - 1])
        now_min = get_min_len(chromosome_info[chr_num - 1])
        if length > max_length:
            if now_max < length:
                update_circlen_max(chromosome_info[chr_num - 1], length)
            if now_min > length:
                update_circlen_min(chromosome_info[chr_num - 1], length)

    for i,each_chr in enumerate(chromosome_info):
        if get_start_point(each_chr) < get_end_point(each_chr):
            ob_chr = ToolsChromosome(caseid = case, chr_ci = toCHR(i+1),chr_start = get_start_point(each_chr), chr_end = get_end_point(each_chr), max_length_circ = get_max_len(each_chr), min_length_circ = get_min_len(each_chr))
            ob_chr.save()
    return caseid

@csrf_exempt
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
    (header, results, file_type, species) = process_upload(request, filename)
    caseid = save(header, results, file_type, species)
    return redirect('render_display', caseid=caseid)


# ======================== UPLOAD & SAVE ==============================

def check_status(request):
    if request.method == 'GET':
        md5 = request.GET['caseid']
        try:
            md5ob = get_object_or_None(UploadParametersMD5, md5=md5)
            process_status = md5ob.status
            print("STATUS CODE: ", process_status)
            return JsonResponse([{'status': process_status}], safe=False)
        except:
            print("check status error: No object returned or attribute is not correct")
            return JsonResponse([{'status': 404}], safe=False)
    else:
        raise Http404





# ===================== HANDLE AJAX CALL =================================

# ---------------------fake handle_file1---------------------------------------
@csrf_exempt
def fake_handle_file1(request):
    # database needed: ToolsChromosome, ToolsEachobservation
    if request.method == 'GET':
        case_id = request.GET['caseid']
        print("Fake handle_file 1 ", case_id)
        # chr_ci = toCHR(int(request.GET['chr']))
        chr_ci = "chr20"
        start = int(request.GET['start'])
        end = int(request.GET['end'])
        obs = ToolsEachobservation.objects.filter(caseid__exact=case_id).filter(chr_ci__exact=chr_ci).order_by('-circRNA_start')[:1]
        print("fake file1 obs length:",len(obs))
        print("file1 parameters: ", chr_ci, start, end)
        print("obs file1:", obs)
        results = []
        for ob in obs:
            result_draw = {
                'start': ob.circRNA_start,
                'end': ob.circRNA_end
            }
            results.append(result_draw)
        print("Fake Handle_file1 results: ", results)
        return JsonResponse(results, safe=False)
    else:
        print("your request for file1 is not get")
        raise Http404
# ------------------------fake handle_flie2---------------------------------
def fake_handle_file2(request):
    if request.method == 'GET':
        case_id = request.GET['caseid']
        # chr_ci = toCHR(int(request.GET['chr']))
        chr_ci = "chr20"
        # start = int(request.GET['start'])
        # end = int(request.GET['end'])
        # print(start)
        # print(end)
        # print(chr_ci)
        gene_type = "exon"
        circ_ob = ToolsEachobservation.objects.filter(caseid__exact=case_id).filter(chr_ci__exact=chr_ci).order_by('-circRNA_start').first()
        start = circ_ob.circRNA_start
        end = circ_ob.circRNA_end

        print("\n")
        print("Fakefile2 start end:", start, end)
        print("\n")

        obs = ToolsAnnotation.objects.filter(chr_ci__exact=chr_ci).filter(gene_type__exact=gene_type).filter(gene_start__gte=start).filter(gene_end__lte=end)
        print("file2 obs: ", obs)
        results = []
        for ob in obs:
            result = {
                    'name': ob.gene_name,
                    'start': ob.gene_start,
                    'end': ob.gene_end
                    }
            results.append(result)
        print("fake_file2 results: ", results)
        return JsonResponse(results,safe=False)
    else:
        print("your request for file2 is not get")
        raise Http404

# ---------------------handle_file1---------------------------------------
@csrf_exempt
def handle_file1(request):
    # database needed: ToolsChromosome, ToolsEachobservation
    if request.method == 'GET':
        case_id = request.GET['caseid']
        print("File2 caseid: ", case_id)
        chr_ci = toCHR(int(request.GET['chr']))
        start = int(request.GET['start'])
        end = int(request.GET['end'])
        obs = ToolsEachobservation.objects.filter(caseid__exact=case_id).filter(chr_ci__exact=chr_ci).filter(circRNA_start__gte=start).filter(circRNA_end__lte=end)
        print("!!!1:",len(obs))
        print("parameters: ", chr_ci, start, end)
        results = []
        for ob in obs:
            result_draw = {
                'start': ob.circRNA_start,
                'end': ob.circRNA_end
            }
            results.append(result_draw)
        print("Handle_file1 results: ", results)
        return JsonResponse(results, safe=False)
    else:
        print("your request for file1 is not get")
        raise Http404

# ------------------------handle_flie2---------------------------------
def handle_file2(request):
    if request.method == 'GET':
        case_id = request.GET['caseid']
        chr_ci = toCHR(int(request.GET['chr']))
        start = int(request.GET['start'])
        end = int(request.GET['end'])
        print(start)
        print(end)
        print(chr_ci)
        gene_type = "exon"
        obs = ToolsAnnotation.objects.filter(chr_ci__exact=chr_ci).filter(gene_type__exact=gene_type).filter(gene_start__gt=start).filter(gene_end__lt=end)
        print("file2", obs)
        results = []
        for ob in obs:
            result = {
                    'name': ob.gene_name,
                    'start': ob.gene_start,
                    'end': ob.gene_end
                    }
            results.append(result)
        #print("file2222", results)
        return JsonResponse(results,safe=False)
    else:
        print("your request for file2 is not get")
        raise Http404

# ------------------------genList---------------------------------
@csrf_exempt
def genList(request):
    if request.method == "GET":
        md5 = request.GET['caseid']
        start = int(request.GET['start'])
        end = int(request.GET['end'])
        chr_ci = toCHR(int(request.GET['chr']))
        print("genList parameters: ", md5, start, end, chr_ci)
        obs = ToolsAnnotation.objects.filter(chr_ci__exact=chr_ci).filter(gene_type__exact="gene").filter(gene_start__gte=start).filter(gene_end__lte=end)
        print("genList: ", obs)
        results = []
        for ob in obs:
            result = {
                    'name': ob.gene_name,
                    'start': ob.gene_start,
                    'end': ob.gene_end
                    }
            results.append(result)
        return JsonResponse(results, safe=False)

    else:
        print("genList method is not GET")
        raise Http404

# -------------------handle_file_4 (no file3 required) ------------------------------
def handle_file4(request):
    # Database used: ToolsChromosome, ToolsScalegenome
    if request.method == 'GET':
        caseid = request.GET['case_id']
        obs = ToolsChromosome.objects.filter(caseid__exact=caseid)
        gene_lens = []
        # which chr is involoed:
        chr_inv = [i.chr_ci for i in obs]
        for i in chr_inv:
            gene_ob = ToolsScalegenome.objects.filter(species__exact="human").filter(chr_ci__exact=i)[0]
            lens = gene_ob.genelens_wiki
            result = {'chr':get_chr_num(i), 'chrLen': lens}
            print(lens)
            gene_lens.append(result)

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

def handle_file5(request):
    if request.method == "GET":
        md5 = request.GET['case_id']
        sub_path = "density_result/"
        read_path = sub_path + md5
        if default_storage.exists(read_path):
            results = default_storage.open(read_path).read()
            results_ob = json.loads(results)
            print("This is the head of results: ", results_ob[:2])
            return JsonResponse(results_ob, safe=False)
        else:
            print("No file for path: ", read_path)
            raise Http404


    else:
        print("Handle file5's method is not GET")
        raise Http404


# -------------handle_DENSITY----------------------------------

def handle_biocircos_density(request):
    if request.method == "GET":
        md5 = request.GET['case_id']
        sub_path = "density_result/"
        read_path = sub_path + md5
        if default_storage.exists(read_path):
            results = default_storage.open(read_path).read()
            results_ob = json.loads(results)[1:]
            print("Hanle_biocircos_density: This is the head of results: ", results_ob[:2])
            return JsonResponse(results_ob, safe=False)
        else:
            print("No file for path: ", read_path)
            raise Http404


    else:
        print("Handle file5's method is not GET")
        raise Http404



# -------------Density computation----------------------------------

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
                print("Failed: get_chr_num error. chr_ci:", chr_ci)
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
        if over >= (gene_len * overlap_rate) or over == circ_len or over == gene_len:
            return True
        else:
            return False

def keep_tops(last_lst, now):
    """A funtion that takes a fix length list, decide whether to keep the now"""

    lst = [now] + last_lst
    slst = sorted(lst, key=lambda x: x['density'])
    return slst[:-1]

def aggregate(dic, chr_ci):
    """calculate values in dic and return list of blocks with their calibrated density
    >>> a = {1: 0, 2:0, 3:0, 4:4, 5:5,6:0,7:2}
    >>> r = aggregate(a, "hi")
    >>> r
    [{'chr': 'hi', 'start':4, 'end':5, 'density':82}, {'chr':'hi', 'start':7, 'end': 7, 'density': 18}]

    """
    total = 0
    last = 0
    sep = 0
    start, end = 0, 0
    blocks = []
    length = len(dic)
    for i in dic:
        now = dic[i]
        if now == 0 and last == 0:
            pass
        elif now != 0 and last == 0:
            sep += now
            if rs_den > 100:
                rs_den = 100
            elif rs_den < 1:
                rs_den = 1
            start = i
            last = now
            if i == length:
                b = {'chr': chr_ci, 'start': start, 'end': start, 'density': sep}
                blocks.append(b)
                total += sep
                sep = 0
        elif now != 0 and last != 0:
            sep += now
            last = now
            if i == length:
                b = {'chr': chr_ci, 'start': start, 'end': i, 'density': sep}
                blocks.append(b)
                total += sep
                sep = 0
        elif now == 0 and last != 0:
            end = i - 1
            total += sep
            b = {'chr': chr_ci, 'start': start, 'end': end, 'density': sep}
            blocks.append(b)
            sep = 0
            last = now


    for ob in blocks:
        ob['density'] = round(ob['density'] / total * 100)
    return blocks


@csrf_exempt
def run_density(request):
    try:
        if request.method == "GET":
            caseid = request.GET['md5']
            # Change status in database to running
            md5ob = get_object_or_None(UploadParametersMD5, md5=caseid)
            md5ob.status = 101
            species = md5ob.species
            print("Species: ", species)
            md5ob.save()

            # Get basic information
            # create circRNA and gene group based on chr
            data_groups = [[] for _ in range(2)]
            results = []
            # chr exist in the uploaded file
            chr_exist = ToolsChromosome.objects.filter(caseid__exact=caseid)
            print("chr_exist: ", chr_exist)
            results = [{'chrnum': chr_exist.count(), 'species': species}]

            # max density count, min count
            max_count = 0
            min_count = sys.maxsize
            densitys = 0

            ########## loop ##########
            for i in chr_exist:
                # get current chr length
                chr_ci = i.chr_ci
                print("Chr: ", chr_ci)
                chr_num_now = get_chr_num(chr_ci)
                # static info
                data_groups[0] = ToolsEachobservation.objects.filter(caseid_id__exact=caseid).filter(chr_ci__exact=chr_ci)
                print("circ: ", len(data_groups[0]))
                data_groups[1] = ToolsAnnotation.objects.filter(gene_type__exact="gene").filter(chr_ci__exact=chr_ci)
                print("gene: ", len(data_groups[1]))

                # start the loop
                for each in data_groups[1]:
                    start, end = each.gene_start, each.gene_end
                    name = each.gene_name
                    # THE ACTUAL loop
                    count = 0
                    #for r in data_groups[0].filter(circRNA_start__gt = circ_start).filter(circRNA_end__lt = circ_end):
                    for r in data_groups[0]:
                        if circ_isin(each, r):
                            count += 1
                    if count != 0:
                        ret = {'name': name, 'chr': chr_num_now , 'start': start, 'end': end, 'value': count}

                        # record total density
                        densitys += count
                        results.append(ret)
                        if count > max_count:
                            max_count = count
                        elif count < min_count:
                            min_count = count

                print("---------------------------")


            print("THIS ++++++++++++++ IS FILE5")

            count_range = max_count - min_count
            print("Max count, Min count, Count_range: ", max_count, min_count, count_range)

            # scale to 1 - 100
            results_first = results[:1]
            results_get = operate_scale(results[1:], (1,100), 'value')

            # sort density
            values = results_get
            print("NO EAT first ob: in run:", results_get[:1])
            print(values)
            results_sort = sorted(values, key=lambda x: x['value'])
            results = results_first + results_sort

            # top chart list
            top_num = 50
            tops = results_sort[-top_num:]
            tops = tops[::-1]

            print("file5 has been handled with lens of returning list: ",len(results))

            # Write result to a file
            result_sub_path = 'density_result/'
            result_path = result_sub_path + caseid
            save_results = write_to_path(result_path, results)

            # Write tops to a file
            tops_sub_path = 'tops_result/'
            tops_path = tops_sub_path + caseid
            save_tops = write_to_path(tops_path, tops)

            # Change status in database
            if save_results and save_tops:
                md5ob = get_object_or_None(UploadParametersMD5, md5=caseid)
                md5ob.status = 200
                md5ob.save()
            else:
                print("Failed: save results or save tops failed ...")
            return JsonResponse([], safe=False)

        else:
            raise Http404
    except Exception as e:
        print("Running failed: ", e)
        caseid = request.GET['md5']
        md5ob = get_object_or_None(UploadParametersMD5, md5=caseid)
        md5ob.status = 404
        md5ob.save()
        return JsonResponse([], safe=False)


def operate_scale(lst, scale, attribute):
    try:
        max_ob = max(lst, key=lambda x: x[attribute])
        min_ob = min(lst, key=lambda x: x[attribute])
        ob_range = max_ob[attribute] - min_ob[attribute]
        scale_range = scale[1] - scale[0]
        lst_copy = lst[:]
        for rs in lst_copy:
            new_value = scale[0] + ((rs[attribute] - min_ob[attribute]) / ob_range) * scale_range
            rs[attribute] = round(new_value)
        return lst_copy
    except ZeroDivisionError:
        print("Warning: Max and min is identical in the list, scale to max_scale_value")
        for i in range(len(lst)):
            lst[i][attribute] = scale[1]
        return lst
    except TypeError as e:
        print("Failed: in operate_scale check types in input list: ", e)
    except Exception as e:
        print("Error :", e)







def write_to_path(result_path, data):
    try:
        if default_storage.exists(result_path):
            default_storage.delete(result_path)
        json_result = json.dumps(data)
        r_path = default_storage.save(result_path, ContentFile(json_result)) # note this path doesnot include the media root, e.g. it is actually stored in "media/data/xxxxxx"
        print("Success: Write to path success!", r_path)
        return True
    except Exception as e:
        print("Failed: write to path failed:", e)



def scale_den(f, scale):
    print("start loop")
    while f >= scale[1] or f <= scale[0]:
        if f >= scale[1]:
            f = f / 10
        elif f <= scale[0]:
            f = f * 10
        else:
            break
    print("break loop")
    return f


@csrf_exempt
def pixel_run_density(request):
    try:
        if request.method == "GET":
            caseid = request.GET['md5']

            # change status in db
            md5ob = get_object_or_None(UploadParametersMD5, md5=caseid)
            md5ob.status = 101
            species = md5ob.species
            print("Species: ", species)
            md5ob.save()

            # chrnum
            chrnumos = ToolsChromosome.objects.filter(caseid_id__exact=caseid)
            chrnum = chrnumos.count()
            print("Chr_num: ", chrnum)



            # get chromosome info
            chr_exist = ToolsScalegenome.objects.filter(species__exact=species)
            print("Chr_exist length: ", chr_exist.count())
            results = [{'chrnum': chrnum, 'species': species}]
            for chro in chr_exist:
                length = chro.genelens_wiki
                chr_ci = chro.chr_ci
                print("chr_ci: ", chr_ci)
                print("length: ", length)
                chr_pixels = {a:0 for a in range(1, length + 1)}
                circos = ToolsEachobservation.objects.filter(caseid_id__exact=caseid).filter(chr_ci__exact=chr_ci)

                print("hihihih")
                print("Circos: ", circos)
                circos_num = circos.count()
                print("chr: ", chr_ci)
                print("Circles: ", circos_num)
                print("Chr_base_length: ", length)
                for circ in circos:
                    start = circ.circRNA_start
                    end = circ.circRNA_end
                    assert start <= length, "Gene start is larger than record chr length"
                    assert end <= length, "Gene end is larger than record chr length"
                    for p in range(start, end+1):
                        chr_pixels[p] += 1
                agg = aggregate(chr_pixels)
                results += agg
                print("Result of {} is calculated".format(chr_ci))
                print("-------------------------------")

            # Write results to a file
            result_sub_path = 'density_result/'
            result_path = result_sub_path + caseid

            if default_storage.exists(result_path):
                default_storage.delete(result_path)
            json_result = json.dumps(results)
            r_path = default_storage.save(result_path, ContentFile(json_result)) # note this path doesnot include the media root, e.g. it is actually stored in "media/data/xxxxxx"
            print("density_result save path: ", r_path)


            # Change status in database
            md5ob = get_object_or_None(UploadParametersMD5, md5=caseid)
            md5ob.status = 200
            md5ob.save()
        else:
            print("request method not GET")
            raise Http404
    except Exception as e:
        print("Failed: Pixels_run failed...")
        print("Error: ", e)


def lenChart(request):
    if request.method == 'GET':
        caseid = request.GET['caseid']
        partitions = 20
        circ_info = ToolsChromosome.objects.filter(caseid__exact=caseid)
        max_circ_len = max([i.max_length_circ for i in circ_info])
        min_circ_len = min([i.min_length_circ for i in circ_info])
        step = (max_circ_len - min_circ_len) // partitions
        points = [i * step for i in range(1, partitions+1)]
        results = [0]*partitions
        now_start, now_end = 0, 0

        circs = ToolsEachobservation.objects.filter(caseid__exact=caseid)
        for i in circs:
            circ_len = i.circRNA_end - i.circRNA_start
            group = circ_len // step
            if group == partitions:
                group -= 1
            results[group] += 1
        re = {'x': points, 'y': results}
        print("result of lenChart", re)
        return JsonResponse(re, safe=False)
    else:
        raise Http404







def exonChart(request):
    if request.method == 'GET':
        caseid = request.GET['caseid']

    else:
        raise Http404


def isoChart(request):
    if request.method == 'GET':
        pass
    else:
        raise Http404




