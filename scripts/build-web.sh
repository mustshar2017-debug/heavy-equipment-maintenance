#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
rm -rf www
mkdir -p www/data
cp index.html styles.css app.js manifest.json sw.js www/
cp data/*.json www/data/
echo "Web assets staged in www/"
