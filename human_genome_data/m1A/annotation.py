import json
import os


# file line sample
#['chr1', 'HAVANA', 'gene', '11869', '14412', '.', '+', '.', 'gene_id "ENSG00000223972.4"; transcript_id "ENSG00000223972.4"; gene_type "pseudogene"; gene_status "KNOWN"; gene_name "DDX11L1"; transcript_type "pseudogene"; transcript_status "KNOWN"; transcript_name "DDX11L1"; level 2; havana_gene "OTTHUMG00000000961.2";\n']

# data format it split out:
# [{chr_ci:'chr1', species: 'human', gene_name:'CSDN', gene_id:'EN0000', gene_type:'Protein Coding', gene_start: Int, gene_end: Int},.....]

#

def readfile(filename, skipline, maxread, write_file_name, write_file_length_name):
    if not maxread:
        maxread = file_length(filename, skipline)
    print("maxread is ",maxread)

    with open(filename) as f:
        for i in range(skipline):
            next(f)
        write_from_process(f, write_file_name, write_file_length_name, maxread, process_line1)



def write_from_process(f, write_file_name, write_file_length_name, maxread, process_line_fun):
    check_and_remove(write_file_name)
    num = 0
    real_len = 0

    for line in f:
        if num == maxread:
            break
        result_line = process_line_fun(line)
        with open(write_file_name, 'a') as f1:
            if not result_line:
                print('line '+str(num + 1) + ' has finished.-- '+str(round((num+1)/maxread, 3)*100) + '% -useless')

                if num == (maxread-1):
                    f1.write('\n]')
                    print('useless end file')
                num += 1
            else:
                result_json = json.dumps(result_line)
                # data.append(result_line)

                if real_len == 0:
                    f1.write('[\n')

                if num != (maxread - 1):
                    if real_len != 0:
                        f1.write(',\n')
                    f1.write(result_json)
                    print('line '+str(num + 1) + ' has finished.-- '+str(round((num+1)/maxread, 3)*100) + '% - mm')
                    num += 1
                    real_len += 1
                else:
                    f1.write(',\n')
                    f1.write(result_json)
                    f1.write('\n]')
                    print('line '+str(num + 1) + ' has finished.-- '+str(round((num+1)/maxread, 3)*100) + '% -last')


    len_info = json.dumps({"length": real_len + 1})
    with open(write_file_length_name, 'w') as b:
        b.write(len_info)
        b.write('\n')



def check_and_remove(write_file_name):
    try:
        os.remove(write_file_name)
    except:
        pass


def file_length(filename, skipline):
    with open(filename) as f:
        for i in range(skipline):
            next(f)
        length = 0
        for i in f:
            length += 1
        return length



# ===========================================================================
# Process each line
def process_line1(line):
    ob = {}
    sep_line = line.split('\t')
    chr_ci, mod_start, mod_end = sep_line[0], sep_line[1], sep_line[2]
    pubmedid = sep_line[10]
    modid = sep_line[3]
    gene_names = sep_line[11]

    # what's in the get more infor??
    ob['chr_ci'] = string_or_int(chr_ci)
    ob['gene_type'] = string_or_int(gene_type)
    ob['gene_start'] = string_or_int(gene_start)
    ob['gene_end'] = string_or_int(gene_end)
    # print('This is gene_info',gene_infos)
    re = dict(gene_infos, **ob)
    return re
    
def get_more(gene_info):
    c = gene_info.split(',')
    result = {}
    for i in c:
        if i != '\n':
            m = remove_null(i.split(' '))
            #name = first_name(m)
            #content = get_content(m)
            result[str(m[0])] = string_or_int(remove_quote(m[1]))
    return result

def remove_quote(string):
    """
    >>> string = '"hihihihihi"'
    >>> remove_quote(string)
    'hihihihihi'
    """

    if string == '':
        return ''
    elif string[0] == '"':
        return remove_quote(string[1:])
    else:
        return string[0] + remove_quote(string[1:])



def is_str_int(string):
    try:
        s = int(string)
        return True
    except ValueError:
        return False

def string_or_int(string):
    """
    >>> a = '1234'
    >>> b = string_or_int(a)
    >>> type(b)
    <class 'int'>
    >>> c = string_or_int('ssds')
    >>> type(c)
    <class 'str'>
    """
    if is_str_int(string):
        return int(string)
    else:
        return string



def remove_null(lst):
    """
    >>> lst = [' ', 'ded', ' ']
    >>> remove_null(lst)
    ['ded']
    """
    if lst == []:
        return []
    elif lst[0] == ' ' or lst[0] == '':
        return remove_null(lst[1:])
    else:
        return [lst[0]] + remove_null(lst[1:])
# ===========================================================================

def main():
    filename = 'gencode.v19.annotation.gtf'
    # filename = 'test_a.gtf'
    write_file_length_name = 'gencode_length_annotation.json'
    maxread = None
    write_file_name = 'gencode_annotation.json'
    skipline = 5
    readfile(filename, skipline, maxread, write_file_name, write_file_length_name)


if  __name__ == '__main__':
    main()
