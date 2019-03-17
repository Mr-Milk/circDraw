import mysqlconnect as mc
import sys, os


def empty_db(connector):
    # delete from tools_chromosome, tools_eachobservation, tools_uploadmd5
    operator = mc.Operator(connector)
    clean_box = ['tools_chromosome', 'tools_eachobservation', 'tools_uploadmd5']
    for t in clean_box:
        operator.clean_table(t)
    operator.terminate()

def empty_file():
    path_box = ["../cirDraw/media/density_result/", "../cirDraw/media/md5_data/"]
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
    connector = mc.Connector(login_file_name)
    if inp == "migration":
        pass
    elif inp == "clean":
        empty_db(connector)
        empty_file()
    connector.commit_close_db()

if __name__ == '__main__':
    login_file_name = sys.argv[1]
    inp = sys.argv[2]
    main(login_file_name, inp)

