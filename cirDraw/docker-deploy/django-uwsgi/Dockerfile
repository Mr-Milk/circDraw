# CircDraw site backend django dockerfile
# Version: 1.0

FROM python:3.6-slim

MAINTAINER Tianqin Li <jacklitianqin@gmail.com>


ENV TZ "Asia/Shanghai"

ENV PYTHONUNBUFFERED 1


RUN mkdir /docker_api
WORKDIR /docker_api
ADD uwsgi.ini /docker_api/uwsgi.ini
ADD requirements.txt /docker_api/requirements.txt


# uwsgi, adapted from https://github.com/docker-library/python.git
# in file python/3.6/slim/Dockerfile
RUN set -ex \
    && buildDeps=' \
        gcc \
        libbz2-dev \
        libc6-dev \
        libgdbm-dev \
        liblzma-dev \
        libncurses-dev \
        libreadline-dev \
        libsqlite3-dev \
        libssl-dev \
        libpcre3-dev \
        make \
        tcl-dev \
        tk-dev \
        wget \
        xz-utils \
        zlib1g-dev \
    ' \
    && deps=' \
        libexpat1 \
    ' \
    && apt-get update && apt-get install -y $buildDeps $deps --no-install-recommends  && rm -rf /var/lib/apt/lists/* \
    && pip install uwsgi \
    && pip install ujson \
    && apt-get purge --auto-remove -y $buildDeps \
    && find /usr/local -depth \
    \( \
        \( -type d -a -name test -o -name tests \) \
        -o \
        \( -type f -a -name '*.pyc' -o -name '*.pyo' \) \
    \) -exec rm -rf '{}' +
EXPOSE 80

RUN pip install --upgrade pip
# RUN  pip install -i https://pypi.douban.com/simple -r requirements.txt
RUN pip install -r requirements.txt










