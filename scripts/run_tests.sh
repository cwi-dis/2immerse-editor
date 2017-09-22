#!/bin/bash

echo "Running Python tests..."
echo

cd test/
coverage run --source ../app -m unittest discover
coverage report

echo
echo "================================================================================================"
echo

echo "Running JavaScript tests..."
echo

cd ../app/static
jest --coverage --bail
