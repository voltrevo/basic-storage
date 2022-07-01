#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

docker run \
  --name "basic-storage-$TAG" \
  -d \
  --net=host \
  --mount type=bind,source="$SCRIPT_DIR/../data",target=/app/data \
  --restart=unless-stopped \
  "basic-storage:$TAG"
