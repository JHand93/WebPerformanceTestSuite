#!/bin/sh

sudo SUITE_CONFIG="config.json" nodemon -e json --delay 5 --ignore public/ --ignore node_modules/ bin/www

