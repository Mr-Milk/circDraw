import pymysql
import ujson

connection = pymysql.connect(host='127.0.0.1',
                             port=6603,
                             user='root',
                             db='circDraw',
                             password='mypassword',
                             charset='utf8',
                             local_infile=True)

with connection.cursor() as cur:
    counter = 0
    with open('/home/circ/map_circ/server/hg19_circRNA_annotated.txt','r') as f1:
        for line in f1:
            i = line.strip().split('\t')
            cur.execute(f'''INSERT INTO hg19_circRNAs_new (gene,transcript,chr_num,start,end,components) VALUES ("{i[0]}","{i[1]}","{i[2]}","{i[3]}","{i[4]}",{ujson.dumps(i[-1])})''')
    connection.commit()
    with open('/home/circ/map_circ/server/hg38_circRNA_annotated.txt','r') as f2:
        for line in f2:
            i = line.strip().split('\t')
            cur.execute(f'''INSERT INTO hg38_circRNAs_new (gene,transcript,chr_num,start,end,components) VALUES ("{i[0]}","{i[1]}","{i[2]}","{i[3]}","{i[4]}",{ujson.dumps(i[-1])})''')
    connection.commit()
    