# Workstation Studio

Workstation Studio (v0.0.3.677.8) is a browser-based operating system shell connected to a Python WebSocket bridge server that spawns [Workstation CLI](https://github.com/WorkableProjects/WorkstationCLI).

---

## System Requirements & Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Python:** Python 3.11 or higher
- **Git:** Installed and available on system PATH
- **OS:** Linux, macOS, or Windows (via WSL/Bash)

---

## Quick Start & Installation

1. **Clone & Setup:**

   ```bash
   bash install.sh
   ```

   The installation script will:
   - Create a dedicated `~/CLI` directory (non-destructive)
   - Clone the Workstation CLI repository into `~/CLI`
   - Set up system-wide `workstation` command/alias
   - Install Python dependencies for the WebSocket bridge
   - Install npm packages for the frontend UI
   - Run post-installation validation checks

2. **Launch Workstation Studio:**

   ```bash
   npm start
   # or: bash start.sh
   ```

3. **Open Browser:**

   Navigate to `http://127.0.0.1:5173` (or the URL output by Vite in terminal).

4. **Verify CLI Integration:**

   ```bash
   workstation --version
   ```

---

## Features & Included Applications

- **File Manager:** Full two-pane file browser with folder tree, regex search, preview pane, multi-select, and file operations.
- **Notes App:** Markdown editor with live split-pane preview, toolbar, tags, 30s auto-save, undo/redo, and multi-format exports (.md, .pdf, .html).
- **Tasks & Todo:** Time-based task manager with priorities, sub-tasks, calendar/agenda views, and toast notifications.
- **Calculator:** Scientific mode (trig, log, powers, factorial, Deg/Rad) and embedded Desmos graphing calculator mode.
- **Terminal:** Embedded xterm.js terminal connected via Python WebSocket bridge (`ws://127.0.0.1:8765`) to Workstation CLI.

---

## Troubleshooting & FAQ

### Port 8765 or 5173 Already in Use
If the WebSocket bridge fails to start with "Port 8765 in use":
```bash
kill $(lsof -t -i :8765) 2>/dev/null || true
```
If port 5173 is in use, Vite will automatically select the next available port (e.g. 5174).

### Workstation CLI Not Found
Ensure `~/CLI` exists and contains `Workstation.py`. Run `bash install.sh` again to re-link components.

### Python WebSocket Dependencies Missing
Manually install bridge requirements:
```bash
python3 -m pip install -r bridge/requirements.txt
```

---

## Documentation & Repository Links

- **Workstation CLI Repository:** [https://github.com/WorkableProjects/WorkstationCLI](https://github.com/WorkableProjects/WorkstationCLI)
- **Workstation Studio Repository:** [https://github.com/WorkableProjects/WorkstationStudio](https://github.com/WorkableProjects/WorkstationStudio)
