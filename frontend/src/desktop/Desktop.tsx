import { useCallback, useState } from "react";
import { TerminalApp } from "../apps/TerminalApp";
import { NotesApp } from "../apps/NotesApp";
import { CalculatorApp } from "../apps/CalculatorApp";
import { WindowFrame } from "./WindowFrame";
import { APP_META, type AppId, type WindowState } from "../types";

let zCounter = 10;

function createWindow(appId: AppId, offset: number): WindowState {
  const meta = APP_META[appId];
  zCounter += 1;
  return {
    id: crypto.randomUUID(),
    appId,
    title: meta.title,
    x: 48 + offset * 28,
    y: 48 + offset * 28,
    width: meta.defaultWidth,
    height: meta.defaultHeight,
    zIndex: zCounter,
    minimized: false,
  };
}

function renderApp(appId: AppId) {
  switch (appId) {
    case "terminal":
      return <TerminalApp />;
    case "notes":
      return <NotesApp />;
    case "calculator":
      return <CalculatorApp />;
  }
}

export function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>([]);

  const openApp = useCallback((appId: AppId) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.appId === appId && w.minimized);
      if (existing) {
        zCounter += 1;
        return prev.map((w) =>
          w.id === existing.id
            ? { ...w, minimized: false, zIndex: zCounter }
            : w,
        );
      }
      return [...prev, createWindow(appId, prev.length)];
    });
  }, []);

  const focus = (id: string) => {
    zCounter += 1;
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: zCounter } : w)),
    );
  };

  const close = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const minimize = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    );
  };

  const move = (id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w)),
    );
  };

  const minimized = windows.filter((w) => w.minimized);

  return (
    <div className="desktop">
      <header className="menubar">
        <strong className="brand">Workstation Studio</strong>
        <nav className="app-launchers">
          {(Object.keys(APP_META) as AppId[]).map((id) => (
            <button key={id} type="button" onClick={() => openApp(id)}>
              {APP_META[id].title}
            </button>
          ))}
        </nav>
      </header>

      <div className="desktop-surface">
        {windows.map((win) => (
          <WindowFrame
            key={win.id}
            win={win}
            onFocus={focus}
            onClose={close}
            onMinimize={minimize}
            onMove={move}
          >
            {renderApp(win.appId)}
          </WindowFrame>
        ))}

        {windows.length === 0 && (
          <div className="desktop-hint">
            <p>Open Terminal, Notes, or Calculator from the menu bar.</p>
            <p className="muted">
              Terminal needs the local bridge:{" "}
              <code>python3 bridge/server.py</code>
            </p>
          </div>
        )}
      </div>

      <footer className="taskbar">
        {minimized.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => {
              zCounter += 1;
              setWindows((prev) =>
                prev.map((x) =>
                  x.id === w.id
                    ? { ...x, minimized: false, zIndex: zCounter }
                    : x,
                ),
              );
            }}
          >
            {w.title}
          </button>
        ))}
      </footer>
    </div>
  );
}
