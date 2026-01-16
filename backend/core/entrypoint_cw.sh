#!/bin/sh
set -e

exec celery -A core worker --loglevel=info
