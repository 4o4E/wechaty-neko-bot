#!/bin/bash

rm -rf dist
npx tsc
node dist/main.js