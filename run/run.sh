#!/bin/bash

rm -rf dist > /dev/null 2>&1
NEKO_BOT_DIR=run
cd .. && tsc && cd run && node dist/main.js