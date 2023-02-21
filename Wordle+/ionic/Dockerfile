FROM node:18-alpine as build
RUN mkdir /app
WORKDIR /app
COPY ionic-app/package*.json /app/ionic-app/
RUN npm install --prefix ionic-app
COPY ./ /app/
RUN npm run-script build --prefix ionic-app -- --output-path=./dist/out
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/ionic-app/dist/out /usr/share/nginx/html/
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
