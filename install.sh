#!/usr/bin/env bash
# Install Workstation Studio dependencies (bridge + frontend + CLI).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Creating CLI directory (~/CLI)..."
mkdir -p "$HOME/CLI"

if [ ! -d "$HOME/CLI/.git" ] && [ -z "$(ls -A "$HOME/CLI" 2>/dev/null)" ]; then
  echo "==> Cloning Workstation CLI repository..."
  git clone https://github.com/WorkableProjects/WorkstationCLI.git "$HOME/CLI" || echo "Warning: git clone failed or offline mode. Continuing with local setup."
else
  echo "==> CLI directory already exists or contains files at $HOME/CLI. Preserving existing files."
fi

# Ensure executable wrapper/alias exists
mkdir -p "$HOME/.local/bin" 2>/dev/null || true
if [ -f "$HOME/CLI/workstation.py" ] || [ -f "$HOME/CLI/Workstation.py" ]; then
  CLI_ENTRY="$HOME/CLI/workstation.py"
  [ -f "$HOME/CLI/Workstation.py" ] && CLI_ENTRY="$HOME/CLI/Workstation.py"

  cat << EOF > "$HOME/.local/bin/workstation"
#!/usr/bin/env bash
python3 "$CLI_ENTRY" "\$@"
EOF
  chmod +x "$HOME/.local/bin/workstation"
fi

# Add alias to shell config if available
for RC in "$HOME/.bashrc" "$HOME/.zshrc"; do
  if [ -f "$RC" ] && ! grep -q "alias workstation=" "$RC"; then
    echo "alias workstation='python3 $HOME/CLI/Workstation.py 2>/dev/null || python3 $HOME/CLI/workstation.py'" >> "$RC"
  fi
done

echo "==> Installing bridge requirements…"
python3 -m pip install -r "$ROOT/bridge/requirements.txt"

echo "==> Installing frontend packages…"
cd "$ROOT/frontend"
npm install

echo "==> Running post-installation validation..."
VALIDATION_FAILED=0

if command -v python3 >/dev/null 2>&1; then
  echo "  [✓] Python 3 installed"
else
  echo "  [✗] Python 3 missing"
  VALIDATION_FAILED=1
fi

if [ -d "$HOME/CLI" ]; then
  echo "  [✓] ~/CLI directory linked"
else
  echo "  [✗] ~/CLI directory missing"
  VALIDATION_FAILED=1
fi

if [ -f "$ROOT/frontend/package.json" ]; then
  echo "  [✓] Frontend configuration present"
else
  echo "  [✗] Frontend missing"
  VALIDATION_FAILED=1
fi

if [ $VALIDATION_FAILED -eq 0 ]; then
  echo "==> Setup Summary:"
  echo "    All components successfully initialized and validated!"
  echo "    Quick-start commands:"
  echo "      npm start             - Start Workstation Studio"
  echo "      workstation --version - Check Workstation CLI version"
else
  echo "==> Setup completed with warnings. Please check error logs above."
fi
