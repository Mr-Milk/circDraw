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
    """A class that provides looping power and control during the process."""
    def __init__(self, )
