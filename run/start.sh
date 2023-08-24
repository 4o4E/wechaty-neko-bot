#!/bin/bash

rm -rf dist > /dev/null 2>&1

cd ..
tsc
cd run

while true; do
    node dist/main.js
done
