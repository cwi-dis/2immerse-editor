# 2IMMERSE Editor

This repository contains the 2IMMERSE editing platform, a web application for
creating 2IMMERSE presentation in the browser.

The application uses *Flask* as a HTTP server. The frontend is handled by
*React* and *Redux* implemented in *TypeScript*.

## Installation

The application is fully dockerised, so to run it, simply make sure you have
both, `docker` and `docker-compose` installed. The easiest way to do that for
macOS, it to simply download and install the official Docker package for macOS
from the Docker homepage: <https://docs.docker.com/docker-for-mac/install/>

This will install all the required software and command line utilities. In
order to run the application, clone this repository and in the root directory,
run

```
docker-compose build
```

This will download and build all the images and install the application code.
Note that when making changes to any Python code, the entire container needs to
be rebuilt, which can take some amount of time. To speed this process up, you
can invoke the build process and pass in the argument `nojs`:

```
docker-compose build --build-arg nojs=true
```

This will skip installation of Node.js, TypeScript and downloading/installing
all of the packages required for the JS build process. The only caveat of this
approach is that you need to make sure that your `app/static/dist/bundle.js` is
up to date. This is done by running the build instructions (starting with the
line `yarn install`) in the section *Frontend Setup* of this document. This
only needs to be done after `git pull` has brought in new changes to `*.ts`
files or if any of these files were changed locally.

### Frontend Setup

All of the following steps only apply if you want to actually do any frontend
development. If you're not planning to touch the frontend in any way, you can
ignore this entire section as `docker-compose` takes care of this process for
you. Since the application uses TypeScript and React, we also need to setup the
frontend build-chain.

Also install `yarn`, which is more advanced package manager for Node.js. The
following instructions pertain to macOS.

```
brew install yarn
```

Or if you don't want to use `brew` you can also install it via `npm`. However,
doing so is discouraged ([see here](https://yarnpkg.com/en/docs/install#alternatives-tab)).

```
[sudo] npm install -g yarn
```

Next up, build the app

```
cd app/static/
yarn install
yarn run webpack
```

This will install all the application dependencies into a new folder
`node_modules/`. Finally, simply run `yarn run webpack` in the `app/static/`
folder to generate the application bundle.  The bundle needs to be regenerated
every time you perform changes to the frontend code.

## Running the Application

After you're done with the setup, in the top-level directory, call

```
docker-compose up
```

to start all the containers and the HTTP server. The application should now be
accessible from a browser at <http://localhost:8008>. Any changes performed to
the code on the host machine should be reflected in the container
automatically, but you may need to restart the Flask server if you change
something in the backend code. To stop the containers, hit *CMD+C* on the
command line.

### Configuring the Backend

The backend needs configuration information, such as URLs for reaching the
timeline service. The `configuration` subdirectory has JSON files with
configuration for various deployment settings, and scripts `get.sh` and
`put.sh` to modify the configuration settings or a running backend.

### Running Tests

The low-level functionality of the application is to some degree covered by
unit tests. The tests are separated into frontend and backend tests. Backend
tests are run by Python's builtin `unittest` and can be found in the folder
`test/`. Frontend tests are managed by the unit testing framework `jest` and
the test cases are located in `app/static/__tests__/`.

In order to run the backend tests, navigate to the `test/` folder and invoke
the following command:

```
python -m unittest discover
```

This will run all test cases in the current directory. If you want to generate
a code coverage report, first make sure to install Python's `coverage` tool by
running

```
[sudo] pip install coverage
```

Then you can run the test suites and collect code coverage by calling

```
coverage run --source app -m unittest discover
```

The `--source` option ensures that coverage data is only collected for app
files and not for external libraries). After that, to print the code coverage
report, invoke

```
coverage report
```

For running the frontend tests, make sure to use the version of `jest` that
comes bundled with the application to avoid version conflicts.

To run the test suites, it is simply a matter of navigating to `app/static/`
and calling `yarn run jest`. This will run all tests in the `__tests__/`
directory. You can pass the flags `--verbose` and `--coverage` to cause the
runner to print the description of each test case and generate a test coverage
report at the end.

## License and Authors

All code and documentation is licensed by the original author and contributors
under the Apache License v2.0:

* [Centrum Wiskunde & Informatica](https://www.cwi.nl) (original author)

See AUTHORS file for a full list of individuals and organisations that have
contributed to this code.

## Contributing

If you wish to contribute to this project, please get in touch with the authors.

## Acknowledgements

<img src="https://2immerse.eu/wp-content/uploads/2016/04/2-IMM_150x50.png" align="left"/><em>This project was originally developed as part of the <a href="https://2immerse.eu/">2-IMMERSE</a> project, co-funded by the European Commission’s <a hef="http://ec.europa.eu/programmes/horizon2020/">Horizon 2020</a> Research Programme</em>
