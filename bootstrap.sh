#!/bin/bash

cd /app
update-config
cd ..

echo ""
echo "Running NGINX"
echo ""

nginx
