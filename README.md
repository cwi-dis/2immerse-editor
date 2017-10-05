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

### Frontend Setup

All of the following steps only apply if you want to actually do any frontend
development. If you're not planning to touch the frontend in any way, you can
ignore this entire section as `docker-compose` takes care of this process for
you. Since the application uses TypeScript and React, we also need to setup the
frontend build-chain. First off, make sure you have `npm` installed. Then,
install `webpack` globally by running

```
[sudo] npm install -g webpack
```

Webpack is a pluggable module bundler which will be responsible for translating
the TypeScript code and the React components to simple JavaScript and resolve
all the imports.

Also install `yarn`, which is basically npm which understands versions:

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
webpack
```

This will install all the application dependencies into a new folder
`node_modules/`. Finally, simply run `webpack` in the `app/static/` folder to
generate the application bundle.  The bundle needs to be regenerated every time
you perform changes to the frontend code.

## Running the application

After you're done with the setup, in the top-level directory, call

```
docker-compose up
```

to start all the containers and the HTTP server. The application should now be
accessible from a browser at <http://localhost:8000>. Any changes performed to
the code on the host machine should be reflected in the container
automatically, but you may need to restart the Flask server if you change
something in the backend code. To stop the containers, hit *Ctrl+C* on the
command line.

### Configuring the backend

The backend needs configuration information, such as URLs for reaching the
timeline service. The `configuration` subdirectory has JSON files with
configuration for various deployment settings, and scripts `get.sh` and
`put.sh` to modify the configuration settings or a running backend.

### Running tests

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

For running the backend tests, first make sure you have the `jest` binary
installed. To install it, run

```
[sudo] npm install -g jest
```

After that, it is simply a matter of navigating to `app/static/` and calling
`jest`. This will run all tests in the `__tests__/` directory. You can pass the
flags `--verbose` and `--coverage` to cause the runner to print the description
of each test case and generate a test coverage report at the end.

These two steps can be combined into one by running `make test` in the root
directory of the app or running the script `run_tests.sh` in the `scripts/`
directory. Make sure you have `coverage` and `jest` installed
beforehand.
