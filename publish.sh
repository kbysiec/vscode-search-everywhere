#!/usr/bin/env bash
set -e

# Run publisher script with node
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/scripts/publish.js" "$@"
