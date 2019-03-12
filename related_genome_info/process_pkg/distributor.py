# Distributor is intended to read and check the validation of a file, keep yielding one line data to eloop.py, which contains processor and Insertor for each line.

import mysql.connector
import ijson
import json
from annotation import readfile, string_or_int
import random


class Connector:
    """A class serves as connection agent"""

    def __init__(self, login_file_name):
        self.admin = self.read_admin_file(login_file_name)
        self.user = self.admin['user']
        self.password = self.admin['password']
        self.host = self.admin['host']
        self.database = self.admin['database']

    def get_current_login(self, lst):
        return lst[0]

    def read_admin_file(self, login_file_name):
        """prase db info file"""
        assert type(login_file_name) == str
        with open(login_file_name) as f:
            login = self.get_current_login(json.load(f))
            assert len(login) >= 1, 'No login info'
            user = login['user']
            password = login['password']
            host = login['host']
            database = login['database']
        return {'user': user, 'password': password, 'host': host, 'database': database}

    def connect_to_db(self):
        """connect to database and create the cursor and cnx attribute"""
        self.cnx = mysql.connector.connect(user=self.user, password=self.password, host=self.host, database=self.database, auth_plugin='mysql_native_password')
        self.cursor = self.cnx.cursor(buffered=True)



class Checkpoint:
    """A class that serves as checkpoint agent"""
    def __init__(self, connector):
        self.connector = connector

    def is_having_data(self, table_name):
        """Check if there is data in the table"""
        try:
            count_sql = """SELECT count(*) FROM """ + str(table_name) + """;"""
            self.connector.cursor.execute(count_sql)
            result = self.connector.cursor.fetchone()[0]
            if result > 0:
                return True
            return False
        except mysql.connector.Error as err:
            print("Checking having data: {}".format(err))

    def is_exist_table(self, table_name):
        """Check if the table is exist"""
        try:
            query_sql = """SHOW TABLES LIKE '""" + str(table_name) + """';"""
            self.connector.cursor.execute(query_sql)
            result = self.connector.cursor.fetchone()
            if result:
                return True
            else:
                return False
        except mysql.connector.Error as err:
            print('is_exist_table Fail: {}'.format(err))

    def is_exist_column(self, table_name, column_name):
        """ check if specific column name has existed """
        try:
            query_sql = """SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = '""" + str(table_name) + """' and column_name = '"""  + str(column_name) + """';"""
            self.connector.cursor.execute(query_sql)
            result = self.connector.cursor.fetchone()
            if result:
                return True
            else:
                return False
        except mysql.connector.Error as err:
            print('is_exist_column fail: {}'.format(err))

    def is_exist_species(self, table_name, column_name, value):
        """ Check if a specific value is contained in a specific column"""
        try:
            assert self.is_exist_column(self, table_name, column_name), "Column name doesn't existed"
            query_sql = """ SELECT """ + str(column_name) + """ FROM `"""  + str(table_name) + """` WHERE """ + str(column_name) +  """ = {};"""
            final_sql = query_sql.format(value)
            self.connector.cursor.execute(query_sql)
            result = self.connector.cursor.fetchone()
            if result:
                return True
            else:
                return False
        except mysql.connector.Error as err:
            print('is_exist_species fail: {}'.format(err))





class Loop:
    """A class that provides looping power and controls during the process."""
    def __init__(self, )





def main():
    login_file_name = 'admin_login.json'
    annotation = True
    add = True
    scale = True
    gene_wiki = True

    # initial connection
    cnx, cursor = connect_to_db(login_file_name)


    # insert
    # data_file_name_annotation = 'test.json'
    data_file_name_annotation = 'gencode_annotation.json'
    length_info_name_annotation = 'gencode_length_annotation.json'
    table_columns_annotation = ("gene_type VARCHAR(50) NOT NULL","gene_name VARCHAR(200) NOT NULL","chr_ci VARCHAR(50) NOT NULL", "gene_start INT NOT NULL", "gene_end INT NOT NULL", "gene_id VARCHAR(200) NOT NULL")
    table_name_annotation = "tools_annotation"
    if annotation:
        load_and_insert(cnx, cursor, data_file_name_annotation, table_columns_annotation, table_name_annotation, length_info_name_annotation)
        cnx.commit()

    # add species info
    if add:
        add_column(cnx, cursor, table_name_annotation, ["species VARCHAR(300) NOT NULL"], ["'human'"])
        cnx.commit()
    # create scale(min start, max end) table
    table_name_scale = "tools_scalegenome"
    table_columns_scale = ("species VARCHAR(300) NOT NULL", "chr_ci VARCHAR(30) NOT NULL", "gene_min_start INT NOT NULL", "gene_max_end INT NOT NULL")
    if scale:
        toos_scale(cnx, cursor, table_name_scale, table_name_annotation, table_columns_scale, "chr_ci", ["gene_end", "gene_max_end"], ["gene_start", "gene_min_start"])
        cnx.commit()
    if gene_wiki:
        value_pairs = [
            ["'chr1'",  249250621],
            ["'chr2'",  243199373],
            ["'chr3'", 198022430],
            ["'chr4'",  191154276],
            ["'chr5'", 180915260],
            ["'chr6'", 171115067],
            ["'chr7'", 159138663],
            ["'chr8'", 146364022],
            ["'chr9'", 141213431],
            ["'chr10'", 135534747],
            ["'chr11'", 135006516],
            ["'chr12'", 133851895],
            ["'chr13'", 115169878],
            ["'chr14'", 107349540],
            ["'chr15'", 102531392],
            ["'chr16'",  90354753],
            ["'chr17'", 81195210],
            ["'chr18'", 78077248],
            ["'chr19'", 59128983],
            ["'chr20'", 63025520],
            ["'chr21'", 48129895],
            ["'chr22'", 51304566],
            ["'chrX'", 155270560],
            ["'chrY'", 59373566],
            ["'chrM'", 16023]
        ]
        add_one_column_update(cnx, cursor, table_name_scale, "genelens_wiki INT", value_pairs)
        add_one_column(cnx, cursor, table_name_scale, "id INT")


    commit_db(cnx, cursor)


if __name__ == '__main__':
   main()
