## Steps to dockerize the backend

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

