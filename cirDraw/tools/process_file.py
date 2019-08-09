from .models import ToolsEachobservation, ToolsAnnotation, ToolsChromosome, ToolsScalegenome, UploadParametersMD5
# from .views import toCHR, get_chr_num, circ_isin
import sys

# processing file module

## Costomize for every data format ====================
def check_object_valid(info_ob, data_format):
    """Check the object received has valid content"""

    def ok_chr(chr_ci):
        try:
            after = chr_ci[3:]
            if chr_ci[:3] == 'chr' and (int(after) in range(0,40) or after in ['X','Y','M']):
                return True
            else:
                return False
        except ValueError:
            if chr_ci[3:] in ['X','Y','M']:
                return True
            else:
                return False


    try:
        if data_format == "CIRI2 file":
            """['circRNA_ID', 'chr', 'circRNA_start', 'circRNA_end']"""
            assert type(info_ob['circRNA_ID']) == str and info_ob['circRNA_ID'][:3] == 'chr'
            assert type(info_ob['chr_ci']) == str 
            assert ok_chr(info_ob['chr_ci'])
            assert int(info_ob['circRNA_start'])
            assert int(info_ob['circRNA_end'])
            return True
        elif data_format == ".BED file":
            assert type(info_ob['chr_ci']) == str and info_ob['chr_ci'][:3] == 'chr'
            assert ok_chr(info_ob['chr_ci'])
            assert int(info_ob['circRNA_start'])
            assert int(info_ob['circRNA_end'])
            return True
        else:
            return False
    except Exception as e:
        print("Failed: Check_object_valid failed...")
        print("Error: ", e)
        return False 



def make_header(f_iter, data_format):
    if data_format == "CIRI2 file":
        header = next(f_iter).decode("utf-8").split("\t")
        return header, f_iter
    elif data_format == ".BED file":
        header = ['chr', 'circRNA_start', 'circRNA_end']
        return header, f_iter
    else:
        print("Failed: in process_file.make_header, data_format is not archieved, contact need...")
        return [], f_iter

def get_chromosome_num(species):
    if species == "Human":
        return 25
    elif species == "":
        return 1
    else:
        print("Species input error: No species record...")
        return 0


#=======================================================

def handle_uploaded_file(f, filter_lst, md5ob, parameters, toCHR, get_chr_num, circ_isin):
    """
    >>> filter_list = ['CIRI_one_column_name']
    """
    saves = []
    f_iter = iter(f)


    # initiate basic info
    data_format = parameters['FileType']
    species = parameters['Species']
    chromosome_num = get_chromosome_num(species)
    chromosome_info = [[[sys.maxsize, 0], [sys.maxsize, 0]] for _ in range(chromosome_num)]
    zero_length = 0

    data_valid = True
    validation_lines = 100
    check_index = 0
    valid_num = 0
    invalid_num = 0
    do_check = True

    # md5 value
    md5 = md5ob.md5



    header, f_iter = make_header(f_iter, data_format)
    if header == []:
        return 405

    # The process loop
    for line in f_iter:
        line_sep = line.decode().split('\t')
        line_sep, head = fil_lst(line_sep, header, filter_lst)
        info_ob = RNAob(head, line_sep)
       

        # check object is valid:
        if check_object_valid(info_ob, data_format):
            # add valid index
            if do_check:
                valid_num += 1
                check_index += 1

            # save into tools_eachobservation
            save_status = save_line(md5ob, head, info_ob)
            saves.append(save_status)

            # clean up code for tools_chromosome
            chromosome_info = change_chromosome_info(chromosome_info, zero_length, info_ob)
        else:
            if do_check:
                invalid_num += 1
                check_index += 1
            print("Failed: Refuse to insert to database, invalid line: ", info_ob)

         # check stop point
        if check_index == validation_lines:
             if check_index == invalid_num:
                 return 404
             else:
                 do_check = False
                 check_index += 1




    # save chromsome info into database
    save_chromosome_status = save_chromosome_info(chromosome_info, md5ob, toCHR)

    # check if all saved in database
    save_status = all(saves)
    if save_status and save_chromosome_status:
        return 200
    elif not save_status and save_chromosome_status:
        # some valid circleRNA not saved
        return 500
    elif save_status and not save_chromosome_status:
        # circle saved but errors in save_chromosome_status:
        return 501
    else:
        # all failed
        return 502


def save_line(md5ob, header, info_ob):
    """save each observation"""
    try:
        ob = ToolsEachobservation(caseid = md5ob)
        assert type(header) == list, "HEADER passed in to save is not a list"
        e = info_ob
        for each in header:
            exec('ob.' + each +' = ' + 'e["' + each +'"]', globals(), locals())
        ob.save()
        return True
    except:
        return False

def change_chromosome_info(chromosome_info, zero_length, info_ob):
    # update chromosome max end and min start
    try:
        now_chr = info_ob['chr_ci']
        chr_num = get_chr_num(now_chr)
        now_start = int(info_ob['circRNA_start'])
        now_end = int(info_ob['circRNA_end'])
        if chr_num >= 0:
            if now_start < get_start_point(chromosome_info[chr_num-1]):
                update_chromosome_start(chromosome_info[chr_num-1],now_start)
            if now_end > get_end_point(chromosome_info[chr_num - 1]):
                update_chromosome_end(chromosome_info[chr_num-1], now_end)
        else:
            print("one of Your input of chr from the handle file is crap")

        # update max and min length of circle RNA
        length = now_end - now_start
        now_max = get_max_len(chromosome_info[chr_num - 1])
        now_min = get_min_len(chromosome_info[chr_num - 1])
        if length > zero_length:
            if now_max < length:
                update_circlen_max(chromosome_info[chr_num - 1], length)
            if now_min > length:
                update_circlen_min(chromosome_info[chr_num - 1], length)


        return chromosome_info
    except:
        print("change_chromosome compromised")
        raise ValueError




def save_chromosome_info(chromosome_info, md5ob, toCHR):
    # create object in ToolsChromosome
    try:
        for i,each_chr in enumerate(chromosome_info):
            if get_start_point(each_chr) < get_end_point(each_chr):
                ob_chr = ToolsChromosome(caseid = md5ob, chr_ci = toCHR(i+1),chr_start = get_start_point(each_chr), chr_end = get_end_point(each_chr), max_length_circ = get_max_len(each_chr), min_length_circ = get_min_len(each_chr))

                ob_chr.save()
        return True
        print("Success!: in saving chromosome info")
    except:
        print("Failed: save chromosome info failed...")
        return False

##  Origin functions ===================
def fil_lst(line_lst, header, filter_lst):
    lst = []
    head = []
    for i in range(len(header)):
        if header[i] in filter_lst:
            lst.append(line_lst[i])
            head.append(header[i])
    return lst, head



def RNAob(header, data_lst):
    ob = {}
    if len(header) == len(data_lst):
        for i in range(len(header)):
            if header[i] == 'chr':
                header[i] = 'chr_ci'
            header[i] = noslash(nohash(header[i]))
            if header[i] == 'junction_reads_ID':
                ob[str(header[i])] = data_lst[i][:-2]
            else:
                ob[str(header[i])] = noslash(data_lst[i])
        return ob
    else:
        return {"NO": [header, data_lst]}


def nohash(str):
    if str[0] != '#':
        return str
    else:
        return nohash(str[1:])


def noslash(str):
    if str == '':
        return str
    elif str[0] == '\n':
        return noslash(str[1:])
    else:
        return ''.join([str[0], noslash(str[1:])])




class Header:
    def __init__(self, lst):
        name = "-".join(lst)
        self.lst = lst
        self.name = name
    def __repr__(self):
        return self.name





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

###  backup
def save(md5, header, results, file_type, species):
    """Save file"""
    chromosome_info = [[[sys.maxsize, 0], [sys.maxsize, 0]] for _ in range(25)]
    max_length = 0
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
