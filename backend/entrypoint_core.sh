#!/bin/sh
set -e

python manage.py makemigrations
python manage.py migrate
python manage.py create_gtfs_task -e 15 -p minutes
python manage.py create_map_task -e 3 -p days

exec gunicorn core.wsgi:application -c gunicorn.conf.py
