# Workstation Studio

Browser-based desktop shell for [Workstation CLI](./CLI/WorkstationCLI). Frontend-only app with a localhost bridge that spawns the CLI in a PTY.

## Stack

- **Frontend:** Vite + React + TypeScript + xterm.js
- **Bridge:** Python WebSocket server on `ws://127.0.0.1:8765` (no external APIs / keys)
- **Notes:** `localStorage`

## Quick start

From the repo root:

```bash
./install.sh   # once — installs bridge + frontend deps
./start.sh     # runs bridge/server.py and npm run dev together
```

Open the Vite URL printed in the terminal (usually http://127.0.0.1:5173), then launch **Terminal**, **Notes**, or **Calculator** from the menu bar.

`Ctrl+C` in that terminal stops both the frontend and the bridge.

### Manual (optional)

```bash
# Terminal 1 — bridge
python3 -m pip install -r bridge/requirements.txt
python3 bridge/server.py

# Terminal 2 — UI
cd frontend
npm install
npm run dev
```

## Apps

| App | Role |
|-----|------|
| Terminal | Connects to the bridge and runs Workstation CLI |
| Notes | CRUD notes in localStorage |
| Calculator | Local arithmetic UI |

## Notes

- Do not put API keys in this project.
- Workstation CLI itself is not modified by this repo’s Studio code; the bridge only launches it.
- CLI needs Python **3.11+** per its README; the bridge process uses whatever `python3` is on your PATH.
