#!/bin/sh
# Runs before the templates are rendered: without a valid file storage origin the CSP would be wrong,
# so the container refuses to start.
set -eu

origin="${PORTAL_FILES_ORIGIN:-}"
if [ -z "$origin" ]; then
    echo "portal-web: PORTAL_FILES_ORIGIN is required (for example https://files.example.org)." >&2
    exit 1
fi

if ! printf '%s' "$origin" | grep -Eq '^https://[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$'; then
    echo "portal-web: PORTAL_FILES_ORIGIN must be an https origin without path, port or trailing slash." >&2
    exit 1
fi
