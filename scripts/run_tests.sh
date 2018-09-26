#!/bin/bash

echo "Running Python tests..."
echo

export KIBANA_SERVICE_URL=""
export LOGLEVEL="WARN"
cd test/
${PYTHON:-python} -m coverage run --source ../app -m unittest discover
${PYTHON:-python} -m coverage report

echo
echo "================================================================================================"
echo

echo "Running JavaScript tests..."
echo

cd ../app/static
jest --coverage --bail
