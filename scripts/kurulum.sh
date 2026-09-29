#!/usr/bin/env bash
# Claude Code bulut ortamı / yerel kurulum
set -e
pip install -r requirements.txt 2>/dev/null || pip install -r requirements.txt --break-system-packages
npm install
test -f node_modules/three/build/three.min.js || { echo "HATA: three@0.158.0 UMD derlemesi bulunamadı"; exit 1; }
npx playwright install --with-deps chromium || npx playwright install chromium
python3 scripts/render_mufredat.py
echo "Kurulum tamam."
