#!/usr/bin/env bash
# Install Workstation Studio dependencies (bridge + frontend).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Installing bridge requirements…"
python3 -m pip install -r "$ROOT/bridge/requirements.txt"

echo "==> Installing frontend packages…"
cd "$ROOT/frontend"
npm install

echo "==> Done. Run ./start.sh to launch Studio."
