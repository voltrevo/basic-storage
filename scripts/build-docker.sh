#!/bin/bash

set -euo pipefail

TAG="git-$(git rev-parse HEAD | head -c7)"
docker build . -t "$REPO:$TAG"
docker push "$REPO:$TAG"

echo Success "$REPO:$TAG"
