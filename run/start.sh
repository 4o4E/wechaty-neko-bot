#!/bin/bash

rm -rf dist > /dev/null 2>&1
NEKO_BOT_DIR=run

cd ..
tsc
cd run

while true; do
    node dist/main.js
done
