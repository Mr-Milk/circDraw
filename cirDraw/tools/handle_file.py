import pymysql
import os
import re
import ujson
from intervaltree import IntervalTree
import multiprocessing as mp
from time import sleep
from .models import *
from django.db import connection
from collections import Counter


def line_counter(file):
    line_count = 0


    with open(file,'r') as f:
        for line in f:
            line_count += 1

    return line_count

def split_file(config):
    line_count = line_counter(config['FILE_NAME'])

    open_files = []

    for i in range(1, config['CORE_NUM'] + 1):
        t = open(f"{config['FILE_NAME']}.{i}", 'w+')
        open_files.append(t)

    with open(config['FILE_NAME'],'r+') as f:
        split_size = round(line_count / config['CORE_NUM'], 0) + 1
        split_batch = 1
        counter = 0

        for line in f:
            counter += 1
            open_files[split_batch-1].write(line)

            if counter == split_size:
                 counter = 0
                 split_batch += 1

    for f in open_files:
        f.close()

def concat_files(config, delete_old=True):
    path = '/'.join(config['FILE_NAME'].split('/')[0:-1]) + '/'
    with open(path + config['NEW_FILE'], 'w+') as f:
        for i in range(1, config['CORE_NUM'] + 1):
            with open(f"{path}{config['NEW_FILE']}.{i}",'r') as c:
                for line in c:
                      f.write(line)
    if delete_old:
        try:
            for f in [f"{path}{config['NEW_FILE']}.{i}" for i in range(1, config['CORE_NUM'] + 1)]:
                os.remove(f)
        except Exception as e:
            print('Delete splited files failed:', e)
    
    return path + config['NEW_FILE']

def find_exons(assembly, transcript, start, end):

    get_exons_script = f'select * from {assembly}_genome_exons_introns where transcript="{transcript}";'

    with connection.cursor() as cur:
        cur.execute(get_exons_script)
        get_exons = cur.fetchall()

    

    # add index to column `transcript`

    try:
        exon_tree = IntervalTree.from_tuples(
            tuple([(e[4], e[5], e[7]) for e in get_exons if e[4] < e[5]])
        )
    except Exception as e:
        print(f'Error in building interval tree, {e}')
        return 0, []

    exon_pool = {e[7]: {'type': e[2], 'start': e[4], 'end': e[5],
                        'strand': e[6], 'id': e[7], 'mods': e[-1]} for e in get_exons if e[4] != e[5]}


    query_tree = [[i[0],i[1],i[2]] for i in exon_tree[start:end]]

    if len(query_tree) == 0:
        return 0, []
    else:
        exon_combo = [exon_pool[ID] for ID in [i[2] for i in query_tree]]
        # calculating score to match the best transcript
        # What is the best transcript?: https://www.nature.com/articles/srep34985

        if query_tree[0][0] < start:
            query_tree[0][0] = start

        if end < query_tree[-1][1]:
            end = query_tree[-1][1]

        return sum([i[1] - i[0] for i in query_tree]), exon_combo

def find_exon_combo(chr_num: str, circStart: int, circEnd: int, assembly: str, bias=2):
    '''
    return format
    [{'type': 'exon', 'start': 123, 'end': 456,
            'strand': '+', 'id': 'ENSE0009546'},
    {'type': 'intron', 'start': 5687, 'end': 9867,
            'strand': '+', 'id': 'ENSE0004356'}]
    '''

    # 这里查找genes
    try:
        get_gene_script = f'select id from {assembly}_genome_genes where start<={circStart+bias} and end>={circEnd-bias};'
        with connection.cursor() as cur:
            cur.execute(get_gene_script)
            get_gene = cur.fetchall()
    except:
        return None, None, None

    transcripts_pool = []
    if len(get_gene) == 0:
            #print(f'circRNA: {chr_num}|{circStart}-{circEnd}: \033[33mGene Not Found\033[0m')
        return None, None, None
    elif len(get_gene) > 0:

        for i in get_gene:
            get_transcripts_script = f'select id from {assembly}_genome_transcripts where gene="{i.id}" and start<={circStart+bias} and end>={circEnd-bias};'
            with connection.cursor() as cur:
                cur.execute(get_transcripts_script)
                get_transcripts = cur.fetchall()
            if len(get_transcripts) == 0:
                pass
            else:
                for t in get_transcripts:
                    score, exon_combo = find_exons(assembly, t[0], circStart, circEnd)
                    if score > 0:
                        transcripts_pool.append((score, t[0], i, exon_combo))

        if len(transcripts_pool) == 0:
            return None, None, None
            #print(f'circRNA: {chr_num}|{circStart}-{circEnd}: \033[31mNo match transcript\033[0m')
        else:
            sort_transcripts_pool = sorted(
                    transcripts_pool, key=lambda x: x[0])
            combo = sort_transcripts_pool[-1][-1]
            gene = sort_transcripts_pool[-1][2]
            transcript = sort_transcripts_pool[-1][1]

            return combo, gene, transcript

def process_file(file, assembly: str, file_type, new_file, task_id, bias=2):

    cols = {'bed': [0, 1, 2],
            'ciri': [1, 2, 3]}

    circ_on_gene = {}
    # circ_on_gene = {'GeneID': ['GeneINFO', 'circINFO']}
    # GeneINFO: [ID, chr, start, end, name, type]
    # circINFO: a list, check https://my-json-server.typicode.com/Mr-Milk/circDraw-api/circRNAs
    unmap_circ = []

    with open(file, 'r') as f:
        for line in f:
            # check if validate
            valid_line = True
            try:
                l = [line[i] for i in cols[file_type]]
                assert l[0].lower().startswith('chr')
                assert len(l[0][3:-1]) <= 3
                assert int(l[1]) < int(l[2])
            except:
                valid_line = False

            if valid_line:
                # map circ to annotated_circ
                chr_num = l[0].lower()
                start = int(l[1])
                end = int(l[2])

                result_script = f'select * from {assembly}_circRNAs where chr_num="{chr_num}" and start>={start-bias} and start<={start+bias} and end<={end+bias} and end>={end-bias};'
                with connection.cursor() as cur:
                    cur.execute(result_script)
                    result = cur.fetchall()
                
                possible_circ = [
                    (i[4] - i[3] - (end - start), i) for i in result]

                if len(possible_circ) > 0:
                    # append to circ_on_gene
                    circ = sorted(possible_circ, key=lambda x: x[0])[
                                  0][1].dict()
                    circ['source'] = 'CIRCpedia V2'

                    try:
                        circ_on_gene[circ['gene']][1].append(circ)
                    except:
                         # get gene info
                        geneINFO_script = f'''select * from {assembly}_genome_genes where gene="{circ['gene']}";'''

                        with connection.cursor() as cur:
                            cur.execute(geneINFO_script)
                            geneINFO = cur.fetchall()

                        circ_on_gene[geneINFO[0].id] = [
                            geneINFO[0].dict(), [circ]]

                else:
                    unmap_circ.append(l)

    for circ in unmap_circ:
        combo, gene, transcript = find_exon_combo(circ[0].lower(), int(circ[1]), int(circ[2]), assembly)
        if combo is not None:
            try:
                circ_on_gene[gene][1].append({"start": int(circ[1]),
                                                    "end": int(circ[2]),
                                                    "source": "circDraw_annotated",
                                                    "components": combo})
            except:
                    # get gene info
                geneINFO_script = f'select * from {assembly}_genome_genes where gene="{gene}";'
                with connection.cursor() as cur:
                    cur.execute(geneINFO_script)
                    geneINFO = cur.fetchall()

                circ_on_gene[geneINFO[4]] = [geneINFO, [{"start": int(circ[1]),
                                                    "end": int(circ[2]),
                                                    "source": "circDraw_annotated",
                                                    "components": combo}]]


    #### write to file
    print('This is new_file:', new_file)
    with open(new_file, 'w+') as f:
        for _,v in circ_on_gene.items():
            info = v[0].append(v[1])
            line = task_id + '\t' + '\t'.join(info)
            f.write(line+'\n')
        # columns
        # TASK_ID, id, chr, start, end, gene_name, gene_type, circ_on_gene_all, circ_num


    # insert into database
    # LOAD LOCAL INFILE `the file`


    # calculate density, after everything is executed, after join() of multiprocessing
    # using mysql: SELECT geneid,COUNT(*) as count FROM tablename GROUP BY geneid ORDER BY count DESC;


""" 
config = {
    'FILE_NAME':'./epiData/hg19_genome_genes.txt',
    'CORE_NUM': 4,
    'FILE_TYPE': 'bed',
    'NEW_FILE':'hhh.txt',
    'ASSEMBLY': 'hg19',
    'TASK_ID': 'md5_value'
} """

def handle(config):
    #try:
    split_file(config)
    path = '/'.join(config['FILE_NAME'].split('/')[0:-1]) + '/'
    new_files = [f"""{config['FILE_NAME']}_circDraw_generate.{i}""" for i in range(1,config['CORE_NUM'] + 1)]
    jobs = []
    for i in new_files:
        p = mp.Process(target=process_file, args=(config['FILE_NAME'], config['ASSEMBLY'], config['FILE_TYPE'], i, config['TASK_ID']))
        jobs.append(p)
    
    for j in jobs:
        j.start()
    
    for j in jobs:
        j.join()
    
    print(f'Finish processing {config["TASK_ID"]}')

    concat_files(config)

    # calculation of density and circRNA length distribution
    circRNA_length = []
    circRNA_isoform = []
    with open(f"{path}{config['NEW_FILE']}", 'r') as f:
        with open(f"{path}{config['TASK_ID']}_density", 'w') as c:
            for line in f:
                info = line.split('\t')
                circINFO = ujson.loads(info[-1])
                # density table
                # md5 id chr_num start end name type circ_num
                for i in circINFO:
                    circRNA_length.append(i['end'] - i['start'])
                circRNA_isoform.append(info[5], len(circINFO))
                c.write('\t'.join(info[0:-1]) + '\t' + len(circINFO) + '\n')

    tmp_circ_len = Counter(circRNA_length).items()
    circRNA_length_distribution = ujson.dumps({"x":[k for k in tmp_circ_len],
                                   "y":[v for _,v in tmp_circ_len]})

    tmp_circRNA_isoform = sorted(circRNA_isoform, key=lambda x: x[1], reverse=True)[0:20]
    circRNA_isoform = ujson.dumps({"x":[k for k in tmp_circRNA_isoform],
                        "y":[v for _,v in tmp_circRNA_isoform]})

    # load file to database
    with connection.cursor() as cur:
        table_name = "UserTable"
        cur.execute('''SET GLOBAL local_infile = 1;''')
        cur.execute(f"""LOAD DATA LOCAL INFILE '{path}{config['TASK_ID']}_density' IGNORE INTO TABLE {table_name} character set utf8mb4 fields terminated by '\t' lines terminated by '\n' (`md5`,`id`,`chr_num`, `start`,`end`,`name`,`gene_type`, `circ_on_gene_all`, `circ_num`);""")
        connection.commit()
            


    return False,circRNA_length_distribution,circRNA_isoform
    '''except Exception as e:
        print('Handle Error:', e)
        return True,circRNA_length_distribution,circRNA_isoform'''


