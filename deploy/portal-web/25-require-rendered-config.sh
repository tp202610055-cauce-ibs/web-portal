#!/bin/sh
# Runs after the templates are rendered: the base image only logs a failed render, so an unwritable
# /etc/nginx/conf.d would start nginx with no site. Here the container refuses to start instead.
set -eu

for file in /etc/nginx/conf.d/portal.conf /etc/nginx/conf.d/security-headers.inc; do
    if [ ! -s "$file" ]; then
        echo "portal-web: $file was not rendered; mount /etc/nginx/conf.d as a tmpfs writable by uid 101." >&2
        exit 1
    fi
done
