import pymysql
import sys
import os
import re
import time
import logging

# files not remove from the database
EXCEPTION = ['8bd10a77cbda74ed2513d2643a39b0bb']
# deleted related files and data after 24h
EXPIRED_TIME = 72
# check file change every 5 min
PERIOD = 5*60
PATH = 'md5_data/'

# configure log
logging.basicConfig(filename='watch_file.log', level=logging.DEBUG, format='%(asctime)s %(message)s')

# establish connection
connection = pymysql.connect(host='127.0.0.1',
                             port=6603,
                             user='root',
                             db='circDraw',
                             password='mypassword', 
                             charset='utf8')

def files_age():
    global connection
    with connection.cursor() as cursor:
        cursor.execute('select MD5,time_created from tools_uploadmd5')
        files_info = cursor.fetchall()
        now = time.time()
        for i in files_info:
            if i[0] not in EXCEPTION:
                existed_time = round((now - i[-1])/3600,2)
                if existed_time >= EXPIRED_TIME:
                    logging.info(f"Record {i[0]} already expired, {existed_time}")

                    try:
                        cursor.execute(f"delete from tools_uploadmd5 where MD5 = '{i[0]}';")
                        logging.info(f"Success: Delete record {i[0]} from tools_uploadmd5")
                    except Exception as e:
                        logging.error(f"Error: Delete record {i[0]} from tools_uploadmd5 failed, {e}")

                    try:
                        cursor.execute(f"delete from UserTable where md5 = '{i[0]}';")
                        logging.info(f"Success: Delete record {i[0]} from UserTable")
                    except Exception as e:
                        logging.error(f"Error: Delete record {i[0]} from UserTable failed, {e}")
                    
                    try:
                        cursor.execute(f"delete from UserDensity where md5 = '{i[0]}';")
                        logging.info(f"Success: Delete record {i[0]} from UserDensity")
                    except Exception as e:
                        logging.error(f"Error: Delete record {i[0]} from UserDensity failed, {e}")

                    try:
                        cursor.execute(f"delete from StatisticTable where md5 = '{i[0]}';")
                        logging.info(f"Success: Delete record {i[0]} from StatisticTable")
                    except Exception as e:
                        logging.error(f"Error: Delete record {i[0]} from StatisticTable failed, {e}")

                    try:
                        for f in os.listdir(PATH):
                            if re.search(i[0], f):
                                os.remove(os.path.join(PATH, f))
                        logging.info(f"Success: Delete record {i[0]}'s file")
                    except Exception as e:
                        logging.error(f"Error: Delete record {i[0]}'s file failed, {e}")

if __name__ == '__main__':
    logging.info('Running file watcher...')
    while True:
        files_age()
        time.sleep(PERIOD)