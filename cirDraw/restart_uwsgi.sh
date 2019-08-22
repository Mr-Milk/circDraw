#! /bin/bash
kill -9 $(pgrep uwsgi);
sudo uwsgi --ini /home/circ/circDraw/cirDraw/uwsgi.ini --uid circ --enable-threads;


cd /home/circ/circDraw/process_watchdog/
python3 resetdb.py admin_login.json clean

#> /var/log/uwsgi/circDraw.log
