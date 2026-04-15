#!/usr/bin/env bash
set -euo pipefail

# Kick off the Vite build with 4 GB heap for Node so we avoid the OOM killer.
NODE_OPTIONS="--max-old-space-size=4096" npm run build "$@"
