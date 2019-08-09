
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


def is_line_valid(line, header, filter_lst):
    line_sep = line.decode().split('\t')
    line_sep, head = fil_lst(line_sep, header, filter_lst)
    info_ob = RNAob(head, line_sep)


    # check object is valid:
    if check_object_valid(info_ob, data_format):
