#!/usr/bin/python3

import mysqlconnect as mc
import datetime, time
import os


def delete_file_outputlog(file_path, logfile, r=False):
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
        message = "Success: File/Dir {} has been deleted! :)".format(file_path)
    else:
        message = "Failed: File/Dir remains in {}. Listing file names:".format(file_path)

    # log
    with open(logfile, 'a') as f:
        f.write(message)
        f.write("\n")

def cleanup_once(login_file_name, logfile):
    connector = mc.Connector(login_file_name)
    operator = mc.Operator(connector)
    timenow = datetime.datetime.now()
    md5s = operator.autoclean(timenow)
    with open(logfile, 'a') as f:
        f.write("{}: Performing routine cleanup work --------".format(timenow))
        f.write('\n')
    for i in md5s:
        path = '/home/circ/circDraw/cirDraw/media/md5_data/' + str(i)
        delete_file_outputlog(path, logfile)








def main():
    check_duration = 1800 # as in seconds
    login_file_name = '/home/circ/circDraw/process_watchdog/admin_login.json'
    logfile = '/home/circ/circDraw/process_watchdog/auto-clean.log'
    with open(logfile, 'w') as f:
        f.write("{}: Restart auto-clean progress, Good Luck!")
    while True:
        cleanup_once(login_file_name, logfile)
        time.sleep(check_duration)

if __name__ == '__main__':
    main()
