# TFG - Wordle+
Repository to store all the documentation, files and structure of my Final Degree Project (TFG in Spanish). 

The main goal is to develop, as full-stack web developer, a remodel of the Wordle game, including more features and functionalities using Ionic, Django REST Api and PostgreSQL.

## Set up

To test this project, perform the following steps:
As a prerequisite, Docker Compose is needed. Docker Desktop is recommended.

1. Clone the repository.
2. Enter inside the `Wordle+` folder.
3. Run the command `docker-compose build -d`.
4. In the first run,
  - Run `docker-compose up -d`. This may leave the `dj` container not up and needs a reload. Run `docker-comose down` and `docker-compose up -d` again.
  - This is due to the database initialization.
5. In other runs, execute `docker-compose up -d` normally.
6. Enter to http://localhost.
