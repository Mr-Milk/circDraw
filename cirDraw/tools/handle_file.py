import os
import re
import ujson, demjson
from intervaltree import IntervalTree
import multiprocessing as mp
import time
from .models import *
#from django.db import connection
import numpy as np
import pymysql
import sqlalchemy
from sqlalchemy.pool import QueuePool

#engine = sqlalchemy.create_engine('mysql+pymysql://root:mypassword@167.179.90.87:6603/circDraw', poolclass=QueuePool)
engine = sqlalchemy.create_engine('mysql+pymysql://root:mypassword@127.0.0.1:6603/circDraw?charset=utf8&local_infile=1', poolclass=QueuePool)


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
    global engine
    engine.dispose()
    connection = engine.raw_connection()
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
    global engine
    engine.dispose()
    connection = engine.raw_connection()
    try:
        get_gene_script_1 = f'select id from {assembly}_genome_genes where chr_num="{chr_num}" and start<={circStart+bias} and end>={circStart-bias};'
        get_gene_script_2 = f'select id from {assembly}_genome_genes where chr_num="{chr_num}" and start<={circEnd+bias} and end>={circEnd-bias};'
        with connection.cursor() as cur:
            cur.execute(get_gene_script_1)
            get_gene_1 = cur.fetchall()
            cur.execute(get_gene_script_2)
            get_gene_2 = cur.fetchall()
        get_gene = get_gene_1 + get_gene_2
    except Exception as e:
        print('When get gene', e)
        return None, None, None

    transcripts_pool = []
    if len(get_gene) == 0:
            #print(f'circRNA: {chr_num}|{circStart}-{circEnd}: \033[33mGene Not Found\033[0m')
        return None, None, None
    elif len(get_gene) > 0:
        for i in get_gene:
            get_transcripts_script_1 = f'select id from {assembly}_genome_transcripts where gene="{i[0]}" and start<={circStart+bias} and end>={circStart-bias};'
            get_transcripts_script_2 = f'select id from {assembly}_genome_transcripts where gene="{i[0]}" and start<={circEnd+bias} and end>={circEnd-bias};'
            try:
                with connection.cursor() as cur:
                    cur.execute(get_transcripts_script_1)
                    get_transcripts_1 = cur.fetchall()
                    cur.execute(get_transcripts_script_2)
                    get_transcripts_2 = cur.fetchall()
                get_transcripts = get_transcripts_1 + get_transcripts_2
                #print(get_transcripts)
            except Exception as e:
                print('When get transcripts', e)
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
            gene = sort_transcripts_pool[-1][2][0]
            transcript = sort_transcripts_pool[-1][1]

            return combo, gene, transcript

def process_file(file, assembly: str, file_type, task_id, bias=2):
    global engine
    engine.dispose()
    connection = engine.raw_connection()
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
                sl = line.split()
                l = [sl[i] for i in cols[file_type.lower()]]
                assert l[0].lower().startswith('chr')
                assert len(l[0][3:-1]) <= 3
                assert int(l[1]) < int(l[2])

            except:
                valid_line = False
                print("Invalid line:", line)


            if valid_line:
                # map circ to annotated_circ
                try:
                    chr_num = 'chr' + l[0][3::].upper()
                    start = int(l[1])
                    end = int(l[2])
                    #time1 = time.time()
                    result_script = f'select * from {assembly}_circRNAs_{chr_num} where start>={start-bias} and start<={start+bias} and end<={end+bias} and end>={end-bias};'
                    with connection.cursor() as cur:
                        cur.execute(result_script)
                        result = cur.fetchall()
                    #time2 = time.time()

                    #print('Query MySQL1', len(result), f'Used {round(time2-time1,2)}s')

                    possible_circ = [
                        (i[4] - i[3] - (end - start), i) for i in result]

                    if len(possible_circ) > 0:
                        # append to circ_on_gene
                        circ = sorted(possible_circ, key=lambda x: x[0])[
                                    0][1]
                        try:
                            if type(circ[-1]) == list:
                                components = circ[-1]
                            elif type(circ[-1]) == str:
                                components = demjson.decode(circ[-1].encode('utf-8'))
                        except Exception as e:
                            print('demjson decode ERROR:', e)
                        for i in components:
                            i['mods'] = ujson.loads(i['mods'])
                        with connection.cursor() as cur:
                            cur.execute(f'select disease from circ_disease where assembly="{assembly}" and chr_num="{chr_num}" and start>={start-bias} and start<={start+bias} and end<={end+bias} and end>={end-bias};')
                            disease = cur.fetchall()
                        #print(disease)
                        if len(disease) == 0:
                            disease = 'Unknown'
                        else:
                            disease = disease[0]
                        circ_json = {"start": int(circ[3]),
                                "end": int(circ[4]),
                                "source": "CIRCpedia V2",
                                "gene": circ[0],
                                "transcript": circ[1],
                                "disease": disease,
                                "components": components}
                        #print('This is gene of circ', circ[0])

                        if circ[0] in circ_on_gene.keys():
                            #print('Check if key in circ_on_gene exist:', circ_on_gene.keys())
                            circ_on_gene[circ[0]][1].append(circ_json)
                            #print('Gene existed:', len(circ_on_gene[circ[0]][1]))
                        else:
                            # get gene info
                            geneINFO_script = f'''select * from {assembly}_genome_genes where id="{circ[0]}";'''
                            #time3 = time.time()
                            with connection.cursor() as cur:
                                cur.execute(geneINFO_script)
                                geneINFO = cur.fetchall()
                            #time4 = time.time()
                            #print('Query MySQL2', f'Used {round(time4-time3,2)}s')
                            geneINFO = [str(i) for i in geneINFO[0]]
                            #print(geneINFO)
                            circ_on_gene[geneINFO[4]] = [
                                list(geneINFO), [circ_json]]
                            #print('Gene not existed:', circ_on_gene)

                    else:
                        unmap_circ.append(l)
                except Exception as e:
                    print(mp.current_process().name, "Failed to process:", line, e)

    print('Unmapped circ number:', len(unmap_circ))

    for circ in unmap_circ:
        try:
            try:
                combo, gene, transcript = find_exon_combo(circ[0], int(circ[1]), int(circ[2]), assembly)
                #print(gene, transcript)
            except Exception as e:
                print('When calculating exon combo', e)
            if combo != None:
                #print('before components')
                try:
                    #print(type(combo))
                    if type(combo) == list:
                        components = combo
                    elif type(combo) == str:
                        components = demjson.decode(combo.encode('utf-8'))
                except Exception as e:
                    print(e)
                #print('After components')
                try:
                    disease = 'Unknown'
                    for i in components:
                        if type(i['mods']) == str:
                            i['mods'] = ujson.loads(i['mods'])
                    #print('alter components')
                    with connection.cursor() as cur:
                        cur.execute(f'select disease from circ_disease where assembly="{assembly}" and chr_num="{chr_num}" and start>={start-bias} and start<={start+bias} and end<={end+bias} and end>={end-bias};')
                        find_disease = cur.fetchall()
                        #print(find_disease)
                    if len(find_disease) > 0:
                        disease = find_disease[0]
                except Exception as e:
                    print('When mapping disease',e)

                try:
                    circ_on_gene[gene][1].append({"start": int(circ[1]),
                                                        "end": int(circ[2]),
                                                        "source": "circDraw_annotated",
                                                        "gene": gene,
                                                        "transcript": transcript,
                                                        "disease": disease,
                                                        "components": components})
                except:
                        # get gene info
                    geneINFO_script = f'select * from {assembly}_genome_genes where id="{gene}";'
                    with connection.cursor() as cur:
                        cur.execute(geneINFO_script)
                        geneINFO = cur.fetchall()
                    try:
                        geneINFO = [str(i) for i in geneINFO[0]]
                        circ_on_gene[geneINFO[4]] = [geneINFO, [{"start": int(circ[1]),
                                                            "end": int(circ[2]),
                                                            "source": "circDraw_annotated",
                                                            "gene": gene,
                                                            "transcript": transcript,
                                                            "disease": disease,
                                                            "components": components}]]
                    except Exception as e:
                        print("Add circ error:", e)
        except Exception as e:                
            print(mp.current_process().name, "Failed to process one unmapped circ:", circ[0], int(circ[1]), int(circ[2]), e)
    
    print('Mapped circ:', len(circ_on_gene))
    return circ_on_gene
    #print(circ_on_gene)
    #### write to file
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
    global engine
    engine.dispose()
    connection = engine.raw_connection()
    print("Running handle")
    try:
        split_file(config)
        path = '/'.join(config['FILE_NAME'].split('/')[0:-1]) + '/'
        splited_files = [f"""{config['FILE_NAME']}.{i}""" for i in range(1,config['CORE_NUM'] + 1)]
        print(splited_files)
        args = []
        for i in splited_files:
            args.append((i, config['ASSEMBLY'], config['FILE_TYPE'], config['TASK_ID']))
        
        with mp.Pool(len(args)) as p:
            circ_on_gene_all = p.starmap(process_file, args)

        result = {}
        for i in circ_on_gene_all:
            for k,v in i.items():
                try:
                    result[k][1] += v[1]
                except:
                    result[k] = v
        #print('raw result:', circ_on_gene_all)
        print('Create result file:', path + config['NEW_FILE'])
        with open(path + config['NEW_FILE'], 'w+') as f:
            for _,v in result.items():
                #print('Before Info',k, v[0],type(v[0]), type(v[1]))
                gene = v[0]
                info = [gene[4],gene[0],gene[1],gene[2],gene[5],gene[6]]
                info.append(ujson.dumps(v[1]))
                info.append(str(len(v[1])))
                line = config["TASK_ID"] + '\t' + '\t'.join(info)
                #print('Check columns number:', len(line.split('\t')) == 9)
                #print(line.split('\t')[-1])
                f.write(line+'\n')

        print(f'Finish processing {config["TASK_ID"]} | Generated new file {config["NEW_FILE"]}')

        #concat_files(config, delete_old=False)

        #print(f'Concating success {config["TASK_ID"]}')

        # calculation of density and circRNA length distribution
        circRNA_length = []
        circRNA_isoform = []
        gene_density = []
        with open(f"{path}{config['NEW_FILE']}", 'r') as f:
            for line in f:
                #print(line)
                info = line.split('\t')
                circINFO = ujson.loads(info[-2])
                # density table
                # md5 id chr_num start end name type circ_num
                for i in circINFO:
                    circRNA_length.append(i['end'] - i['start'])
                circRNA_isoform.append((info[5], len(circINFO)))
                density_info = info[0:-2]
                #print(type(density_info), density_info)
                density_info.append(len(circINFO))
                gene_density.append(density_info)
        #print(gene_density)
        tmp_gene_density = sorted(gene_density, key=lambda x:x[-1])
        with open(f"{path}{config['TASK_ID']}_density", 'w') as c:
            for t in tmp_gene_density:
                c.write('\t'.join([str(i)for i in t]) + '\n')

        print(f'circRNA length capacity: {len(circRNA_length)}',
        f'circRNA isoform capacity: {len(circRNA_isoform)}')

        def count_dist(array, step):
            up_edge = int(array.max())
            down_edge = int(array.min())
            interval = int(round((up_edge - down_edge)/step,0))
            s = [down_edge]
            start = down_edge
            for i in range(step):
                new = start + interval
                s.append(new)
                start = new
            s[-1] = up_edge
            cord = {}
            for i in range(1,len(s)):
                sum_val = 0
                for el in array:
                    if el >= s[i-1] and el < s[i]:
                        sum_val += 1
                cord[s[i]] = sum_val
                if i == len(s) or i == 1:
                    cord[s[i]] += 1
            return cord
        try:
            tmp_circ_len = {}
            if len(circRNA_length) > 16:
                tmp_circ_len = count_dist(np.array(circRNA_length,dtype=np.float64),16)
            else:
                tmp_circ_len = count_dist(np.array(circRNA_length,dtype=np.float64),len(circRNA_length))
        except Exception as e:
            print(e)
        #print(tmp_circ_len)
        circRNA_length_distribution = ujson.dumps({"x":[k for k in tmp_circ_len.keys()],
                                    "y":[v for v in tmp_circ_len.values()]})
        #print("circRNA_length_distribution", circRNA_length_distribution)
        
        tmp_circRNA_isoform = sorted(circRNA_isoform, key=lambda x: x[1], reverse=True)[0:20]
        circRNA_isoform = ujson.dumps({"x":[k for k,_ in tmp_circRNA_isoform],
                            "y":[v for _,v in tmp_circRNA_isoform]})
        #print(circRNA_length_distribution)
        # load file to database
        with connection.cursor() as cur:
            cur.execute('''SET global local_infile = 'ON';''')
            cur.execute('''SHOW global VARIABLES LIKE 'local_infile';''')
            local_infile = cur.fetchall()
            print('LOCAL_INFILE =',local_infile)
            cur.execute(f"""LOAD DATA LOCAL INFILE '{path}{config['NEW_FILE']}' IGNORE INTO TABLE UserTable character set utf8mb4 fields terminated by '\t' lines terminated by '\n' (`md5`,`gene_id`,`chr_num`, `start`,`end`,`name`,`gene_type`, `circ_on_gene_all`, `circ_on_num`);""")
            cur.execute(f"""LOAD DATA LOCAL INFILE '{path}{config['TASK_ID']}_density' IGNORE INTO TABLE UserDensity character set utf8mb4 fields terminated by '\t' lines terminated by '\n' (`md5`,`gene_id`,`chr_num`, `start`,`end`,`name`,`gene_type`, `circ_num`);""")
            connection.commit()

        return True,circRNA_length_distribution,circRNA_isoform
    except Exception as e:
        print('Handle Error:', e)
        return False,{"x":[],"y":[]},{"x":[],"y":[]}


