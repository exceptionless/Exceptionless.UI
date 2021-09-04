#!/bin/bash

cd /app
update-config
cd ..

echo "Running NGINX"
nginx
