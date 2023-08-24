#!/bin/bash

rm -rf dist > /dev/null 2>&1
cd .. && tsc && cd run && node dist/main.js