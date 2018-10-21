import mysql.connector
import ijson
import json
from annotation import readfile, string_or_int
import random


# load json data:
def get_length_info(length_info_name):
    with open(length_info_name) as f:
        length = json.loads(next(f))['length']
    return length


def ijson_line(line_num, data_file_name):
    with open(data_file_name) as f:
        num = 0
        for line in ijson.items(f, "item"):
            if num != line_num:
                num += 1
                print(str(num) + " is passed.-- " + str(num/line_num) + "%")
                pass
            else:
                print(line)
                break


def load_and_insert(login_file_name, data_file_name, table_columns, table_name, length_info_name):
    cnx, cursor = connect_to_db(login_file_name)
    create_table_core(cursor, table_name, table_columns)
    length = get_length_info(length_info_name)
    with open(data_file_name) as f:
        num = 0
        for line in ijson.items(f, "item"): # Brilliant ijson to load large size json file!
            try:
                if column_is_valid_core(table_columns, line):
                    insert_one(cursor, table_name, table_columns, line)
                    cnx.commit()
                    num += 1
                    print("line " + str(num + 1) + " is inserted.--{}%".format(round(((num+1)/length)*100, 4)))
                else:
                    print("column is not valid: {}".format(line))
                    break
            except:
                print(line)
                break


# connect to database
def get_current_login(lst):
    return lst[0]

def db_login(login_file_name):
    """
    >>> filename = 'admin_login.json'
    >>> db_login(filename)
    {'user': 'root', 'password': 'sysucircDraw@2018', 'host': '127.0.0.1', 'database': 'cirDraw'}
    """
    assert type(login_file_name) == str
    with open(login_file_name) as f:
        login = get_current_login(json.load(f))
        assert len(login) >= 1, 'No login info'
        user = login['user']
        password = login['password']
        host = login['host']
        database = login['database']
    return {'user': user, 'password': password, 'host': host, 'database': database}

def connect_to_db(login_file_name):
    login = db_login(login_file_name)
    user, password, host, database = login['user'], login['password'], login['host'], login['database']
    cnx = mysql.connector.connect(user=user, password=password, host=host, database=database)
    cursor = cnx.cursor()
    return cnx, cursor


# ------------------------------------------------------------

def mulipulate(cnx, cursor, table_name, table_columns, data):
    """
    create table; load data; commit data;  check status;
    """
    if column_is_valid(table_columns, data):
        load_table(cursor, table_name, table_columns, data)
        commit_db(cnx, cursor)
    else:
        print("columns is invalid, do mulipulate again.")


# Create table in database:
def create_table(cursor, table_name, table_columns, data):
    """
    in this function: create table
    >>> table_columns = ("chr_ci VARCHAR(50) NOT NULL", "gene_start INT NOT NULL", "gene_end INT NOT NULL", "gene_id VARCHAR(200) NOT NULL")
    >>> table_name = "human_gene_test"
    >>> data = loadjson("gencode_annotation.json")
    >>> login_file_name = "admin_login.json"
    >>> cnx, cursor = connect_to_db(login_file_name)
    >>> create_table(cursor, table_name, table_columns, data)
    >>> is_exist_table(cursor, table_name)
    True
    >>> drop(cursor, table_name)
    >>> is_exist_table(cursor, table_name)
    False
    >>> commit_db(cnx, cursor)
    """
    assert type(table_name) == str, 'Table_name in create_function call should be str'
    assert type(table_columns) == tuple, 'Table_column_names in create function should be tuple'
    r = column_is_valid(table_columns, data)
    if r:
        create_table_core(cursor, table_name, table_columns)
    else:
        print('column is not valid: ',r)


def create_table_core(cursor, table_name, table_columns):
    if not is_exist_table(cursor, table_name):
        try:
            create_table_syntax = """CREATE TABLE `{}` (""" + """{}, """*(len(table_columns) - 1) + """{})"""
            data_create_table = (table_name,) + table_columns
            command = create_table_syntax.format(*data_create_table)
            cursor.execute(command)
        except mysql.connector.Error as err:
            print("Fail: {}".format(err))
    else:
        print("Table ({}) is exist".format(table_name))
        delete = input('TABLE ' + str(table_name) + ' is already exist, PRESS y/Y to proceed and any other keys to abort: ')
        if delete.lower() == 'y':
            drop(cursor, table_name)
            print('Table ' + str(table_name) + ' has been dropped!')
            create_table_core(cursor, table_name, table_columns)
        else:
            print('Aborted.')



def column_is_valid_core(table_columns, line):
    try:
        for i in table_columns:
            s = i.split(" ")
            assert len(s) >= 1, "No table column specific: {}".format(i)
            name = s[0]
            line[name]
        return True
    except:
        return False


def column_is_valid(table_columns, data, random_size=100):
    """
    test if the column provided is in the data attribute
    >>> import random
    >>> table_columns = ("chr_ci", "gene_start", "gene_end", "gene_id")
    >>> data = loadjson("gencode_annotation.json")
    >>> column_is_valid(table_columns, data)
    True
    """
    try:
        rand_smpl = [data[i] for i in random.sample(range(len(data)), random_size)]
        for e in rand_smpl:
            for i in table_columns:
                s = i.split(" ")
                assert len(s) >= 1, 'Invalid table_colums: {}'.format(i)
                name = i.split(" ")[0]
                e[name]
        return True
    except:
        return False



def drop(cursor, table_name):
    """drop table by name
    """
    try:
        drop_mysql = """DROP TABLES """ + str(table_name) + """;"""
        cursor.execute(drop_mysql)
    except mysql.connector.Error as err:
        print("Drop fail: {}".format(err))

# load data into table

def load_table(cursor, table_name, table_columns, data):
    """Insert data into database
    >>> table_columns = ("chr_ci VARCHAR(50) NOT NULL", "gene_start INT NOT NULL", "gene_end INT NOT NULL", "gene_id VARCHAR(200) NOT NULL")
    >>> table_name = "human_gene_insert_test"
    >>> data = loadjson("gencode_annotation.json")
    >>> login_file_name = "admin_login.json"
    >>> cnx, cursor = connect_to_db(login_file_name)
    >>> create_table(cursor, table_name, table_columns, data)
    >>> load_table(cursor, table_name, table_columns, data)
    >>> cnx.commit()
    >>> is_having_data(cursor, table_name)
    True
    >>> drop(cursor, table_name)
    >>> commit_db(cnx, cursor)
    """
    for ob in data:
        insert_one(cursor, table_name, table_columns, ob)



def insert_one(cursor, table_name, table_columns, ob):
    """Insert one line data
    >> ob = {'gene_id': 'ENSG00000236743.1', 'transcript_id': 'ENST00000441866.1', 'gene_type': 'HAVANA', 'gene_status': 'NOVEL', 'gene_name': 'RP5-857K21.15', 'transcript_type': 'lincRNA', 'transcript_status': 'KNOWN', 'transcript_name': 'RP5-857K21.15-001', 'level': 2, 'tag': 'basic', 'havana_gene': 'OTTHUMG00000156971.1', 'havana_transcript': 'OTTHUMT00000346905.1', 'chr_ci': 'chr1', 'gene_start': 459656, 'gene_end': 461954}
    >> table_columns = ("chr_ci VARCHAR(50) NOT NULL", "gene_start INT NOT NULL", "gene_end INT NOT NULL", "gene_id VARCHAR(200) NOT NULL")
    >> table_name = "human_gene_insert_one_test"
    >> data = loadjson("gencode_annotation.json")
    >> login_file_name = "admin_login.json"
    >> cnx, cursor = connect_to_db(login_file_name)
    >> create_table(cursor, table_name, table_columns, data)
    >> insert_one(cursor, table_name, table_columns, ob)
    >> cnx.commit()
    >> drop(cursor, table_name)
    """
    values = []
    names = []
    for i in table_columns:
        name = i.split(' ')[0]
        names.append(name)
        value = string_or_int(ob[name])
        values.append(value)
    assert len(names) == len(values), 'Bad values and names when insert one line'
    insert_data = names + values
    insert_sql = """INSERT INTO `""" + str(table_name) + """` (""" + """{}, """*(len(table_columns)-1) + """{}) VALUES (""" + """'{}', """*(len(table_columns)-1) + """'{}');"""
    final_sql = insert_sql.format(*insert_data)
    try:
        cursor.execute(final_sql)
    except mysql.connector.Error as err:
        print('Insert One line failded: {}'.format(err))


# attribute in database table:
"""
chr_ci
species
gene_name
gene_id
gene_type
gene_start
gene_end
density(to be updataed by uploaded file)
"""

# check functions
def is_having_data(cursor, table_name):
    """check if there is data in the table"""
    try:
        count_sql = """SELECT count(*) FROM """ + str(table_name) + """;"""
        cursor.execute(count_sql)
        result = cursor.fetchone()[0]
        if result > 0:
            return True
        return False
    except mysql.connector.Error as err:
        print("Checking having data: {}".format(err))



def is_exist_table(cursor, table_name):
    """check if the table is exist
    """
    try:
        query_sql = """SHOW TABLES LIKE '""" + str(table_name) + """';"""
        cursor.execute(query_sql)
        result = cursor.fetchone()
        if result:
            return True
        else:
            return False
    except mysql.connector.Error as err:
        print('Fail: {}'.format(err))





# commit in database
def commit_db(cnx, cursor):
    cnx.commit()
    cursor.close()
    cnx.close()

def main():
    login_file_name = 'admin_login.json'
    data_file_name = 'gencode_annotation.json'
    length_info_name = 'gencode_length_annotation.json'
    table_columns = ("gene_type VARCHAR(50) NOT NULL","gene_name VARCHAR(200) NOT NULL","chr_ci VARCHAR(50) NOT NULL", "gene_start INT NOT NULL", "gene_end INT NOT NULL", "gene_id VARCHAR(200) NOT NULL")
    table_name = "species_human_large_1"
    load_and_insert(login_file_name, data_file_name, table_columns, table_name, length_info_name)

if __name__ == '__main__':
   main()
