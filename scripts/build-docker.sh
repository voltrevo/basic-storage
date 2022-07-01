#!/bin/bash

set -euo pipefail

TAG="git-$(git rev-parse HEAD | head -c7)"
docker build . -t "basic-storage:$TAG"

rm -f build/"basic-storage-$TAG".tar*
mkdir -p build
docker save "basic-storage:$TAG" --output build/"basic-storage-$TAG".tar
gzip build/"basic-storage-$TAG".tar

echo Success build/"basic-storage-$TAG".tar.gz
