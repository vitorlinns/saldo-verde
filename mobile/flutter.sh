#!/usr/bin/env bash
set -e

# Use the larger home partition for Flutter temporary files and pub cache.
export TMPDIR="$HOME/tmp"
export PUB_CACHE="$HOME/.pub-cache"

mkdir -p "$TMPDIR" "$PUB_CACHE"
cd "$(dirname "$0")"

flutter "$@"
