import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { CliBridge } from "../bridge/cliBridge";

export function TerminalApp() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Connecting to bridge…");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 13,
      theme: {
        background: "#0d1117",
        foreground: "#e6edf3",
        cursor: "#e6edf3",
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(host);
    fit.fit();

    const bridge = new CliBridge();
    let started = false;

    const unsub = bridge.onMessage((msg) => {
      if (msg.type === "ready") {
        setStatus("Bridge ready — starting Workstation CLI…");
        const dims = fit.proposeDimensions();
        bridge.start(dims?.cols ?? 80, dims?.rows ?? 24);
        started = true;
      } else if (msg.type === "output") {
        term.write(msg.data);
        setStatus("Connected");
      } else if (msg.type === "exit") {
        term.writeln(`\r\n[process exited: ${msg.code}]`);
        setStatus(`Exited (${msg.code})`);
      } else if (msg.type === "error") {
        term.writeln(`\r\n[bridge error] ${msg.message}`);
        setStatus(msg.message);
      }
    });

    term.onData((data) => {
      if (!started) return;
      try {
        bridge.input(data);
      } catch {
        /* ignore */
      }
    });

    const onResize = () => {
      fit.fit();
      if (!started) return;
      const dims = fit.proposeDimensions();
      if (dims) {
        try {
          bridge.resize(dims.cols, dims.rows);
        } catch {
          /* ignore */
        }
      }
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    bridge
      .connect()
      .then(() => setStatus("Waiting for bridge handshake…"))
      .catch((err: Error) => {
        setStatus(err.message);
        term.writeln(err.message);
        term.writeln("Run: python3 bridge/server.py");
      });

    return () => {
      unsub();
      ro.disconnect();
      bridge.close();
      term.dispose();
    };
  }, []);

  return (
    <div className="terminal-app">
      <div className="terminal-status">{status}</div>
      <div className="terminal-host" ref={hostRef} />
    </div>
  );
}
