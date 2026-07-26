#!/bin/bash
# Build script: builds the project and generates 舞台时光.html
# Usage: bash build.sh

set -e
cd "$(dirname "$0")"

echo "🏗️  Building..."
npx vite build
echo "🔧 Post-processing..."
python3 fix.py
echo "✅ Done: dist/舞台时光.html"
