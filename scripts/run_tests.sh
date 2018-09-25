#!/bin/bash

echo "Running Python tests..."
echo

cd test/
python -m coverage run --source ../app -m unittest discover
python -m coverage report

echo
echo "================================================================================================"
echo

echo "Running JavaScript tests..."
echo

cd ../app/static
jest --coverage --bail
