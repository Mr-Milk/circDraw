#! /bin/bash

cd /home/circ/circDraw/process_watchdog/
python3 /home/circ/circDraw/process_watchdog/resetdb.py admin_login.json clean
python3 /home/circ/circDraw/cirDraw/manage.py runserver 0.0.0.0:8000
