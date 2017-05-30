# 2IMMERSE Editor

This repository contains the 2IMMERSE editing platform, a web application for
creating 2IMMERSE presentation in the browser.

The application uses *Flask* as a HTTP server. The frontend is handled by
*React* and *Redux* implemented in *TypeScript*.

## Installation

The application is fully dockerised, so to run it, simply make sure you have
both, `docker` and `docker-compose` installed. The easiest way to do that for
macOS, it to simply download and install the official Docker package for macOS
from the Docker homepage: https://docs.docker.com/docker-for-mac/install/

This will install all the required software and command line utilities. In
order to run the application, clone this repository and in the root directory,
run `docker-compose build`. This will download and build all the images and
install the application code.

### Frontend Setup

Since the application uses TypeScript and React, we also need to setup the
frontend build-chain. First off, make sure you have `npm` installed. Then,
install `webpack` globally by running `npm install -g webpack`. Webpack is
a pluggable module bundler which will be responsible for translating the
TypeScript code and the React components to simple JavaScript and resolve all
the imports.

Next up, navigate to `app/static/` and run `npm install`. This will install all
the application dependencies into a new folder `node_modules/`. Finally, simply
run `webpack` in the `app/static/` folder to generate the application bundle.
The bundle needs to be regenerated every time you perform changes to the
frontend code.

## Running the application

After you're done with the setup, call `docker-compose up` to start all the
containers and the HTTP server. The application should now be accessible from a
browser at http://localhost:8000. Any changes performed to the code on the
host machine should be reflected in the container automatically, but you may
need to restart the Flask server if you change something in the backend code.
To stop the containers, hit *Ctrl+C* on the command line.
