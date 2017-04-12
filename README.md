# 2IMMERSE Editor

This repository contains the 2IMMERSE editing platform, a web application for
creating 2IMMERSE presentation in the browser.

The application uses *Flask* as a HTTP server, backed by a *PostgreSQL*
database for handling the data. The frontend is handled by *React* and *Redux*
implemented in *TypeScript*.

## Installation

The application is fully dockerised, so to run it, simply make sure you have
both, `docker` and `docker-compose` installed. The easiest way to do that for
macOS, it to simply download and install the official Docker package for macOS
from the Docker homepage: https://docs.docker.com/docker-for-mac/install/

This will install all the required software and command line utilities. In
order to run the application, clone this repository and in the root directory,
run `docker-compose build`. This will download and build all the images and
install the application code.

The next step is initialising the database. To do this, run the following
command:

    docker-compose run web python migration.py create

This will initialise all the tables in the database based on the contents of
the `app/models/` directory. Finally, to make sure all database changes are
applied correctly run the following command:

    docker-compose run web python migration.py upgrade

Finally, you can call `docker-compose up` to start all the containers and the
server. The application should be accessible from a browser on `localhost`
port 8000.
