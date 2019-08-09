FROM nginx:latest

COPY cirDraw_nginx.conf /etc/nginx/sites-available/

RUN mkdir -p /etc/nginx/sites-enabled/\
    && ln -s /etc/nginx/sites-available/cirDraw_nginx.conf /etc/nginx/sites-enabled/ \
    && rm /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
