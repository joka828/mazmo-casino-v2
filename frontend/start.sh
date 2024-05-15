#!/bin/bash

# Replace environment variable in the template and create the final config file
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start NGINX
nginx -g 'daemon off;'