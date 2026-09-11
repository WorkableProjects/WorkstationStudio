#!/usr/bin/env python3
"""
Workstation Studio bridge — localhost WebSocket <-> Workstation CLI PTY.

Listens on ws://127.0.0.1:8765
Protocol (JSON text frames):
  client -> server: {"type":"input","data":"..."} | {"type":"resize","cols":N,"rows":N} | {"type":"start"}
  server -> client: {"type":"output","data":"..."} | {"type":"exit","code":N} | {"type":"error","message":"..."} | {"type":"ready"}
"""

from __future__ import annotations

import asyncio
import json
import os
import pty
import select
import signal
import struct
import fcntl
import termios
from pathlib import Path

import websockets

HOST = "127.0.0.1"
PORT = 8765

ROOT = Path(__file__).resolve().parents[1]
CLI_DIR = ROOT / "CLI" / "WorkstationCLI"
CLI_ENTRY = CLI_DIR / "workstation.py"


def _set_winsize(fd: int, rows: int, cols: int) -> None:
    winsize = struct.pack("HHHH", rows, cols, 0, 0)
    fcntl.ioctl(fd, termios.TIOCSWINSZ, winsize)


async def _read_pty(master_fd: int, queue: asyncio.Queue) -> None:
    loop = asyncio.get_event_loop()
    while True:
        try:
            data = await loop.run_in_executor(
                None, lambda: os.read(master_fd, 4096) if select.select([master_fd], [], [], 0.2)[0] else b""
            )
        except OSError:
            break
        if data:
            await queue.put(("output", data.decode("utf-8", errors="replace")))


async def session(websocket) -> None:
    if not CLI_ENTRY.is_file():
        await websocket.send(json.dumps({
            "type": "error",
            "message": f"CLI not found at {CLI_ENTRY}",
        }))
        return

    await websocket.send(json.dumps({"type": "ready"}))

    master_fd: int | None = None
    pid: int | None = None
    reader_task: asyncio.Task | None = None
    out_queue: asyncio.Queue = asyncio.Queue()

    async def pump_output() -> None:
        while True:
            kind, payload = await out_queue.get()
            if kind == "output":
                await websocket.send(json.dumps({"type": "output", "data": payload}))
            elif kind == "exit":
                await websocket.send(json.dumps({"type": "exit", "code": payload}))
                break

    pump_task = asyncio.create_task(pump_output())

    try:
        async for raw in websocket:
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                # treat plain text as input
                msg = {"type": "input", "data": raw}

            mtype = msg.get("type")

            if mtype == "start" and pid is None:
                cols = int(msg.get("cols") or 80)
                rows = int(msg.get("rows") or 24)
                master_fd, slave_fd = pty.openpty()
                _set_winsize(master_fd, rows, cols)

                pid = os.fork()
                if pid == 0:
                    os.close(master_fd)
                    os.setsid()
                    fcntl.ioctl(slave_fd, termios.TIOCSCTTY, 0)
                    os.dup2(slave_fd, 0)
                    os.dup2(slave_fd, 1)
                    os.dup2(slave_fd, 2)
                    if slave_fd > 2:
                        os.close(slave_fd)
                    os.chdir(str(CLI_DIR))
                    env = os.environ.copy()
                    env["TERM"] = "xterm-256color"
                    os.execvpe("python3", ["python3", str(CLI_ENTRY)], env)

                os.close(slave_fd)
                reader_task = asyncio.create_task(_read_pty(master_fd, out_queue))

                async def wait_child() -> None:
                    loop = asyncio.get_event_loop()
                    code = await loop.run_in_executor(None, lambda: os.waitpid(pid, 0)[1])
                    exit_code = os.WEXITSTATUS(code) if os.WIFEXITED(code) else -1
                    await out_queue.put(("exit", exit_code))

                asyncio.create_task(wait_child())

            elif mtype == "input" and master_fd is not None:
                data = msg.get("data") or ""
                os.write(master_fd, data.encode("utf-8", errors="replace"))

            elif mtype == "resize" and master_fd is not None:
                cols = int(msg.get("cols") or 80)
                rows = int(msg.get("rows") or 24)
                _set_winsize(master_fd, rows, cols)
                if pid:
                    try:
                        os.kill(pid, signal.SIGWINCH)
                    except ProcessLookupError:
                        pass

    except websockets.ConnectionClosed:
        pass
    finally:
        if reader_task:
            reader_task.cancel()
        pump_task.cancel()
        if pid:
            try:
                os.kill(pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
        if master_fd is not None:
            try:
                os.close(master_fd)
            except OSError:
                pass


async def main() -> None:
    print(f"Workstation Studio bridge on ws://{HOST}:{PORT}", flush=True)
    print(f"CLI: {CLI_ENTRY}", flush=True)
    async with websockets.serve(session, HOST, PORT):
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nBridge stopped.", flush=True)
