FROM nginx:latest as main
#RUN rm  /etc/nginx/conf.d/default.conf
cp conf/default.conf /etc/nginx/conf.d/

FROM main
RUN mkdir /usr/share/nginx/html/dist
cp dist/. /usr/share/nginx/html/dist/
