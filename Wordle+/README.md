## Dockerizing the backend

### Django stage

In the root directory, reproduce the following steps:
- Create the directory where the backend is going to be stored: `mkdir django`
- Enter the directory: `cd django`
- Create the requirements file `requirements.txt` with the following content:
``` 
Django==4.1.6
djangorestframework==3.9.0
psycopg2
```
- Create the Dockerfile with the following content:
```  
FROM python:3

# Set environment variables
ENV PYTHONUNBUFFERED 1

COPY requirements.txt /

# Install dependencies.
RUN pip install -r /requirements.txt

# Set work directory.
RUN mkdir /code
WORKDIR /code

# Copy project code.
COPY . /code/

EXPOSE 80
```
- Build the associated image with: `docker build .`
- Enter the root directory: `cd ..`
- Create the `docker-compose.yaml` file with the following content:
``` 
version: "3"

services:     
  dj:
    container_name: dj
    build: django
    command: python manage.py runserver 0.0.0.0:80
    volumes:
      - ./django:/code
    ports:
      - "80:80"
```
- Create the Django project: `docker-compose run dj django-admin startproject projectname .`
- Create the Django app: `docker-compose run dj python manage.py startapp appname`

### PostgreSQL stage

To add the PostgreSQL database:
- Edit the `projectname/settings.py` file, adding the following content:
```
import os

[...]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_NAME'),
        'USER': os.environ.get('POSTGRES_USER'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
        'HOST': 'db',
        'PORT': 5432,
    }
}
```
Make sure to add the `import os` line at the beggining of the file.
- Edit the `docker-compose.yaml`, adding the following content:
```
services:
  db:
    image: postgres
    volumes:
      - ./data/db:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
  dj:
    container_name: dj
    build: django
    command: python manage.py runserver 0.0.0.0:80
    volumes:
      - ./django:/code
    ports:
      - "80:80"
    environment:
      - POSTGRES_NAME=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    depends_on:
      - db
```

## Dockerizing the frontend

- In the root directory, create a new folder, `ionic` for example.
- In this folder, install Ionic with `npm install -g @ionic/cli`
- Create a new Ionic project with `ionic start ionic-app`
- Follow the interactive menu choosing between the different options.
- Create a new `Dockerfile` with the following content:

```
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
```
- Create a new folder called `nginx`, go into this folder an create the `nginx.conf` file with the following content:

```
server {
  listen 80;

  gzip on;

  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html =404;
  }
}
```

- Go back to the root directory, and edit the `docker-compose.yaml` file:

```
version: "3"

services:
  db:
    image: postgres
    volumes:
      - ./data/db:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
  dj:
    container_name: dj
    build: django
    command: python manage.py runserver 0.0.0.0:80
    volumes:
      - ./django:/code
    ports:
      - "80:80"
    environment:
      - POSTGRES_NAME=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    depends_on:
      - db
  ng:
    container_name: ng
    build: ionic
    ports:
      - "8080:80"
```

## Deploying the project

With this dockerized infrastructure, make sure you have installed:
- Docker
- Docker compose
- NPM

Go to the root directory and execute: `docker-compose up`
If the `docker ps` is executed, the three containers are running as this log shows:
```
CONTAINER ID   IMAGE       COMMAND                  CREATED          STATUS          PORTS                                   NAMES
736f1e345ac9   wordle-dj   "python manage.py ru…"   34 minutes ago   Up 13 seconds   0.0.0.0:80->80/tcp, :::80->80/tcp       dj
998c63057b94   wordle-ng   "/docker-entrypoint.…"   34 minutes ago   Up 14 seconds   0.0.0.0:8080->80/tcp, :::8080->80/tcp   ng
1919a618dc33   postgres    "docker-entrypoint.s…"   34 minutes ago   Up 14 seconds   5432/tcp  
```
Where:
- `wordle-dj` is the Django RESTful API, the Controller of the project.
- `wordle-ng` is the Ionic Framework, the Frontend of the project.
- `postgres` is the PostgreSQL database, the Backend of the project.
