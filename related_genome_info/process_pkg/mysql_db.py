import mysql.connector
import ijson
import json
from annotation import readfile, string_or_int
import random
import sys
import datetime


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


def load_and_insert(cnx, cursor, data_file_name, table_columns, table_name, length_info_name):
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
                    print("line " + str(num + 1) + " is inserted into {}.--{}%".format(table_name ,round(((num+1)/length)*100, 4)))
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
    cnx = mysql.connector.connect(user=user, password=password, host=host, database=database, auth_plugin='mysql_native_password')
    cursor = cnx.cursor(buffered=True)
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
            print("{} table has been created!".format(table_name))
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
        print("Table_columns:", table_columns)
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

####### Integrated function ###

def insert_select(cursor, table_name, table_columns, select_sql):
    # insert into action with select method
    names = []
    for i in table_columns:
        name = i.split(' ')[0]
        names.append(name)

    select_column_lens = len(select_sql.split(","))

    assert select_column_lens == len(names), "columns of select method should match the table columns inserted"

    assert select_sql[-1] == ";", "select sql must end with ';'"
    insert_sql = """INSERT INTO `""" + str(table_name) + """` ("""  + """{}, """*(len(table_columns)-1) + """{}) """ + select_sql
    insert_sql = insert_sql.format(*names)

    try:
        cursor.execute(insert_sql)
    except mysql.connector.Error as err:
        print('Insert with select failded: {}'.format(err))


def update_snp(cnx, cursor, mod_table, snp_table, data_type):
    assert is_exist_table(cursor, mod_table), "No such table when adding columns (update_snp)"
    assert is_exist_table(cursor, snp_table), "No such table when adding columns (update_snp)"
    data_type = data_type.lower()
    mod_type = None
    if data_type == 'm6a':
        mod_type = 'm6A'
    elif data_type == 'm1a':
        mod_type = 'm1A'
    elif data_type == 'm5c':
        mod_type = 'm5C'

    if not mod_type:
        raise ValueError("Failed: Unsupported data_type for update_mod...", data_type)
    sql = """update {} as m1a, {} as snp set m1a.disease = snp.GWAS_disease, m1a.SNPid = snp.SNPid where snp.modStart = m1a.modStart and snp.chromosome = m1a.chromosome;""".format(mod_table, snp_table)
    try:
        print("Processing: Update disease and SNPid of {}".format(mod_table))
        print("Start...")
        cursor.execute(sql)
        print("Success: Update {} with disease and SNPid success! :)".format(mod_table))
    except mysql.connector.Error as err:
        print('Failed: Update mod with disease failed: {}'.format(err))







def add_column(cnx, cursor, table_name, table_columns_setting,  union_value):
    # table_columns_setting is a tuples like ("...", "...")

    assert is_exist_table(cursor, table_name), "No such table when adding columns"

    for i in range(len(table_columns_setting)):
        name = table_columns_setting[i].split(' ')[0]
        if is_exist_column(cursor, table_name, name):
            drop_column(cursor, table_name, name)


    # add blank column
    add_sql = """ALTER TABLE `""" + str(table_name) + """` """
    for i in range(len(table_columns_setting)):
        if i == len(table_columns_setting) - 1 or len(table_columns_setting) ==  1:
            add_sql += """ADD {}; """
        else:
            add_sql += """ADD {}, """

    try:
        add_sql = add_sql.format(*table_columns_setting)
        cursor.execute(add_sql)
    except mysql.connector.Error as err:
        print('Add column failded: {}'.format(err))

    # update the value of that column
    update_sql = """UPDATE `""" + str(table_name) + """` SET """
    for i in range(len(table_columns_setting)):
        name = table_columns_setting[i].split(' ')[0]
        value = union_value[i]
        if i == len(table_columns_setting) - 1 or len(table_columns_setting) == 1:
            update_sql += str(name) + """ = {};"""
        else:
            update_sql += str(name) + """ = {},"""
    final_sql = update_sql.format(*union_value)
    try:
        cursor.execute(final_sql)
    except mysql.connector.Error as err:
        print('update column failded: {}'.format(err))



def toos_scale(cnx, cursor, table_name, table_name_origin, table_columns, group_by, max_column=False, min_column=False, species = "'human'"):
    # function of generating tools_scalegenome
    # table_columns = ["species VARCHAR(300) NOT NULL", "chr_ci VARCHAR(30) NOT NULL", "gene_min_start INT NOT NULL", "gene_max_end INT NOT NULL"]

    assert max_column or min_column, "Must specific a column to max or min"
    # get names
    names = []
    for i in range(len(table_columns)):
        name = table_columns[i].split(' ')[0]
        names.append(name)

    # create table
    create_table_core(cursor, table_name, table_columns)
    cnx.commit()

    def max_column_value(max_column):
        return max_column[0]

    def max_column_name(max_column):
        return max_column[1]

    def min_column_value(min_column):
        return min_column[0]

    def min_column_name(min_column):
        return min_column[1]

    # select sql
    select_sql = """SELECT """ + """{} """ + """,{}"""*(len(table_columns) - 3)
    select_sql += """, MIN(""" + str(min_column_value(min_column)) +  """) AS """ + str(min_column_name(min_column))
    select_sql += """, MAX(""" + str(max_column_value(max_column)) + """) AS """ + str(max_column_name(max_column))
    select_sql += """ FROM `""" + str(table_name_origin) + """` WHERE species = """ + str(species) + """ GROUP BY """ + str(group_by)
    select_sql +=  ";"

    final_select_sql = select_sql.format(*names[:-2])

    # insert into table sql

    insert_select(cursor, table_name, table_columns, final_select_sql)



def add_one_column_update(cnx, cursor, table_name, column, value_pairs):
    # value_pairs = [["'chr1'", 20102020].....]
    add_one_column(cnx, cursor, table_name, column)
    name = column.split(' ')[0]
    update_o = """UPDATE `""" + str(table_name)  + """` SET """ + str(name) + """ = """
    for i in value_pairs:
        update = update_o + str(i['length']) + """ WHERE chr_ci = """ + str(i['name']) + """;"""
        cursor.execute(update)
    cnx.commit()

def add_one_column(cnx, cursor, table_name, column):
    name = column.split(' ')[0]
    if is_exist_column(cursor, table_name, name):
        drop_column(cursor, table_name, name)

    sql = """ALTER TABLE `""" + str(table_name) + """` ADD """ + str(column) + """;"""
    cursor.execute(sql)
    cnx.commit()
    print("Success: Add new column for {}".format(table_name))



def build_example_json(cnx, cursor, table_name):
    # create table





    # insert into







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
        print('is_exist_table Fail: {}'.format(err))

def is_exist_column(cursor, table_name, column_name):
    """ check if specific column name has existed """
    try:
        query_sql = """SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = '""" + str(table_name) + """' and column_name = '"""  + str(column_name) + """';"""
        cursor.execute(query_sql)
        result = cursor.fetchone()
        if result:
            return True
        else:
            return False
    except mysql.connector.Error as err:
        print('is_exist_column fail: {}'.format(err))

def is_exist_species(cursor, table_name, column_name, value):
    """ Check if a specific value is contained in a specific column"""
    try:
        assert is_exist_column(cursor, table_name, column_name), "Column name doesn't existed"
        query_sql = """ SELECT """ + str(column_name) + """ FROM `"""  + str(table_name) + """` WHERE """ + str(column_name) +  """ = {};"""
        final_sql = query_sql.format(value)
        cursor.execute(query_sql)
        result = cursor.fetchone()
        if result:
            return True
        else:
            return False
    except mysql.connector.Error as err:
        print('is_exist_species fail: {}'.format(err))

# drop function

def drop_column(cursor, table_name, column_name):
    """ function to drop one column inside a table"""
    # ask
    if is_exist_column(cursor, table_name, column_name):
        print("Column ({}) in table ({}) is exist".format(column_name, table_name))
        delete = input('PRESS y/Y to drop and any other keys to abort: ').lower()
        if delete == 'y':
            drop_sql = """ALTER TABLE `""" + str(table_name) + """` DROP """ + str(column_name)
            cursor.execute(drop_sql)
        else:
            raise Exception("Refuse to drop column ({}) in ({})".format(column_name, table_name))




# commit in database
def commit_db(cnx, cursor):
    cnx.commit()
    cursor.close()
    cnx.close()


def get_input_value(sys_input):
    """Sys_input is exact the same as sys.argv, return dict contain parameters and lists of values of that parameter. Default is stored by {'default': [default_1, default_2...]}"""
    args = {}
    parameter_now = None
    obligated = True
    default = []
    sys_input = sys_input[1:]
    for i in range(len(sys_input)):

        if sys_input[i][0] == '-':
            obligated = False
            parameter_now = sys_input[i][1:]
            # error when parameter_now is 'default'
            if parameter_now == 'default':
                raise ValueError("You have '-default' in your command line input, please include them without '-default'")
            args[parameter_now] = []
        elif obligated:
            default.append(sys_input[i])
        else:
            args[parameter_now].append(sys_input[i])
    re = dict({'default': default}, **args)
    return re


def get_parameter_or_None(dic, para_name):
    if para_name in dic.keys():
        return dic[para_name]
    else:
        return None






def main(sys_argv):
    paras = get_input_value(sys_argv)
    default = paras['default']
    assert len(default) >= 1, "At least database login info is required!"
    login_file_name = default[0]
    annotation = get_parameter_or_None(paras, 'annotation')
    print("This is annotation:", annotation)
    add = get_parameter_or_None(paras, 'add')
    scale = get_parameter_or_None(paras, 'scale')
    gene_wiki = get_parameter_or_None(paras, 'gene_wiki')
    snp_update = get_parameter_or_None(paras, 'snp_update')
    add_id = get_parameter_or_None(paras, 'add_id')


    # initial connection
    cnx, cursor = connect_to_db(login_file_name)


    # insert
    # ====================
    if annotation:
        """
        >>> annotation = ['gencode_annotation.json', 'gencode_length_annotation.json', 'table_columns_info_file', 'tools_annotation']
        >>> table_columns_annotation = ("gene_type VARCHAR(50) NOT NULL","gene_name VARCHAR(200) NOT NULL","chr_ci VARCHAR(50) NOT NULL", "gene_start INT NOT NULL", "gene_end INT NOT NULL", "gene_id VARCHAR(200) NOT NULL")
        """
        data_file_name_annotation = annotation[0]# 'gencode_annotation.json'
        length_info_name_annotation = annotation[1]
        table_columns_info_file = annotation[2]
        # table_columns_annotation
        table_columns_annotation = []
        with open(table_columns_info_file) as table_cfile:
            lines = table_cfile.readlines()
            for cline in lines:
                table_columns_annotation.append(cline[:-1])
        table_columns_annotation = tuple(table_columns_annotation)

        # table_db_name
        table_name_annotation = annotation[3]
        load_and_insert(cnx, cursor, data_file_name_annotation, table_columns_annotation, table_name_annotation, length_info_name_annotation)
        add_one_column(cnx, cursor, table_name_annotation, "id INT")
        cnx.commit()


    # add species info
    if add:
        """add = [table_name]"""
        table_name_add_same_column_value = add[0]
        add_column(cnx, cursor, table_name_add_same_column_value, ["species VARCHAR(300) NOT NULL"], ["'human'"])
        cnx.commit()
    # create scale(min start, max end) table
    if scale:
        """scale = ["tools_scalegenome", "table_columns_scale_column_file_name", "group_by_column_name", max_by, min_by, name_max, name_min, species]
        table_columns_scale = ("species VARCHAR(300) NOT NULL", "chr_ci VARCHAR(30) NOT NULL", "gene_min_start INT NOT NULL", "gene_max_end INT NOT NULL")
        """
        table_name_scale = scale[0]
        table_columns_scale_column_file_name = scale[1]
        table_columns_scale = []
        with open(table_columns_scale_column_file_name) as mm:
            lines = mm.readline()
            for mma in lines:
                table_columns_scale.append(mma)
        table_columns_scale = tuple(table_columns_scale)


        group_by = scale[2]
        max_column = [scale[3], scale[5]]
        min_column = [scale[4], scale[6]]
        species = scale[7].__repr__()
        toos_scale(cnx, cursor, table_name_scale,table_name_annotation, table_columns_scale, group_by, max_column, min_column, species = species)
        cnx.commit()
    if gene_wiki:
        """gene_wiki = [wiki_len_file, table_name_scale]"""
        wiki_len_file = gene_wiki[0]
        table_name_scale = gene_wiki[1]
        with open(wiki_len_file) as wiki_file:
            value_pairs = json.loads(wiki_file.read())
        add_one_column_update(cnx, cursor, table_name_scale, "genelens_wiki INT", value_pairs)
        add_one_column(cnx, cursor, table_name_scale, "id INT")

    if snp_update:
        """snp_update = [mod_table_name, snp_table_name, data_type]"""
        mod_table = snp_update[0]
        snp_table = snp_update[1]
        data_type = snp_update[2]
        update_snp(cnx, cursor, mod_table, snp_table, data_type)
    if add_id:
        """add_id = ["table1", "table2"]"""
        table_names = add_id
        for table in table_names:
            add_one_column(cnx, cursor, table, "id INT")




    commit_db(cnx, cursor)









if __name__ == '__main__':
   main(sys.argv)

