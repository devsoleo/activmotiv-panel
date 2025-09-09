#!/bin/sh
set -e

# Replace env variable placeholders with real values
printenv | grep VITE_ | while read -r line ; do
  key=$(echo $line | cut -d "=" -f1)
  value=$(echo $line | cut -d "=" -f2)

  find /usr/share/nginx/html/ -type f -exec sed -i "s|$key|$value|g" {} \;
done

# Execute the container's main process (CMD in Dockerfile)
exec "$@"