#!/bin/bash

rm -rf dist > /dev/null 2>&1
mkdir run > /dev/null 2>&1
NEKO_BOT_DIR=run
tsc && node dist/main.js