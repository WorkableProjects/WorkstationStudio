#!/usr/bin/env bash
# Start the localhost bridge and the Vite frontend.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BRIDGE_PID=""

# Source CLI environment variables if available
if [ -f "$HOME/CLI/.env" ]; then
  echo "==> Sourcing CLI environment variables from ~/CLI/.env…"
  set -a
  source "$HOME/CLI/.env"
  set +a
elif [ -f "$ROOT/.env" ]; then
  echo "==> Sourcing environment variables from .env…"
  set -a
  source "$ROOT/.env"
  set +a
fi

cleanup() {
  if [[ -n "$BRIDGE_PID" ]] && kill -0 "$BRIDGE_PID" 2>/dev/null; then
    kill "$BRIDGE_PID" 2>/dev/null || true
    wait "$BRIDGE_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "==> Starting bridge (ws://127.0.0.1:8765)…"
PYTHONUNBUFFERED=1 python3 "$ROOT/bridge/server.py" &
BRIDGE_PID=$!

# Give the bridge a moment to bind
sleep 0.5
if ! kill -0 "$BRIDGE_PID" 2>/dev/null; then
  echo "Bridge failed to start. Is port 8765 free?"
  exit 1
fi

echo "==> Starting frontend (npm run dev)…"
cd "$ROOT/frontend"
npm run dev
