import mysqlconnect as mc
import sys, os

def drop_db(connector):
    try:
        # drop table tools_chromosome, tools_eachobservation, tools_uploadmd5
        operator = mc.Operator(connector)
        drop_box = ['tools_chromosome', 'tools_eachobservation', 'tools_uploadmd5']
        for t in drop_box:
            operator.drop_table(t)
        operator.terminate()
        return True
    except Exception as e:
        print("Failed: drop_db in resetdb.py failed...")
        print("Error: ", e)
        return False

def delete_row(connector):
    try:
        # delete some lines from table
        operator = mc.Operator(connector)
        table_name = 'django_migrations'
        conditions = {'app' : 'tools'}
        # table_name = 'tools_uploadmd5'
        # conditions = {'MD5': 'dcf1208e1926aab1af379cedec7f254c'}

        operator.clean_table(table_name, conditions)
        operator.terminate()
        return True
    except Exception as e:
        print("Failed: delete_row in resetdb.py failed...")
        print("Error: ", e)
        return False


def remigrations(connector):
    # clean migrations from both django and mysql, clean created tables
    if drop_db(connector) and delete_row(connector):
        # delete migrations from os
        # delete __pycache__
        delete_file('../cirDraw/tools/migrations/__pycache__/', r=True)
        delete_file('../cirDraw/tools/migrations/0001_initial.py')

        # run migrations
        manage_dir = '../cirDraw/'
        run_migrations(manage_dir)
        print("Success: Remigration finished!")
    else:
        print("Failed: drop_table or delete_row failed...")

def run_migrations(manage_dir):
    try:
        current = os.getcwd()
        os.chdir(manage_dir)
        os.system("python3 manage.py makemigrations")
        print("Success: Makemigrations success! ")
        os.system("python3 manage.py migrate")
        print("Success: Migrate success! ")
        os.chdir(current)
    except Exception as e:
        print("Failed: run_migrtations failed..")
        print("Error: ", e)







def delete_file(file_path, r=False):
    # clean exact file
    if not r:
        # not a directory
        os.system("rm " + file_path)
        is_exist = os.path.isfile(file_path)
    else:
        os.system("rm -r " + file_path)
        is_exist = os.path.isdir(file_path)
    # check if file has been delete
    if not is_exist:
        print("Success: File/Dir {} has been deleted! :)".format(file_path))
    else:
        print("Failed: File/Dir remains in {}. Listing file names:".format(file_path))






def cleandb_except(connector, exception_box, exceptions):
    # delete from table where exceptions won't be deleted.
    operator = mc.Operator(connector)
    for t in exception_box:
        if exceptions != '':
            operator.clean_table(t, {'md5': ['!=', exceptions]})
        else:
            operator.clean_table(t)
        print('Exception drop Success in ', t)
    operator.terminate()







def empty_db(connector, clean_box):
    # delete from tools_chromosome, tools_eachobservation, tools_uploadmd5
    operator = mc.Operator(connector)

    for t in clean_box:
        operator.clean_table(t)
    operator.terminate()

def empty_dir(path_box):

    for path in path_box:
        file_lst = os.listdir(path)
        if file_lst != []:
            sub_path = path + "*"
            os.system("rm " + sub_path)

            # check file has been deleted
            file_lst = os.listdir(path)
            if file_lst == []:
                print("Success: Directory {} has been emptied! :)".format(path))
            else:
                print("Failed: File(s) remains in {}. Listing file names:".format(path))
                for i in file_lst:
                    print("File: ", i)
        else:
            print("Success: Directory {} was empty before. Nothing to remove.".format(path))






def main(login_file_name, inp):
    """Useage: python3 resetdb.py admin_login_file.json clean/migration"""
    connector = mc.Connector(login_file_name)
    if inp == "migration":
        remigrations(connector)
        connector.commit_close_db()

    elif inp == "clean":
        clean_box = ['tools_species_circrnas', 'tools_species_genome_exons_introns', 'tools_species_genome_genes', 'tools_species_genome_transcripts']
        example_md5 = '4672896d383d34c10a4561dddece79aa'#'8bd10a77cbda74ed2513d2643a39b0bb'
        path_box = ["../cirDraw/media/md5_data/"]
        empty_db(connector, clean_box)
        empty_dir(path_box)

        exception_box = ['UserTable', 'tools_uploadmd5', 'StatisticTable', 'UserDensity']
        cleandb_except(connector, exception_box, example_md5)
        connector.commit_close_db()


        #cursor_ob = mc.Cursor(login_file_name)
        #cursor = cursor_ob.origin_cursor
        #cursor.execute(f'''delete from UserTable where md5 != '{example_md5}';''')
        #cursor.execute(f'''delete from tools_uploadmd5 where md5 != '{example_md5}';''')
        #cursor.execute(f'''delete from StatisticTable where md5 != '{example_md5}';''')
        #cursor.execute(f'''delete from UserDensity where md5 != '{example_md5}';''')
        #print(f"Success: Empty table UserTable,tools_uploadmd5,StatisticTable,UserDensity except md5 == '{example_md5}'")
        #cursor_ob.terminate()

if __name__ == '__main__':
    login_file_name = sys.argv[1]
    inp = sys.argv[2]
    main(login_file_name, inp)

