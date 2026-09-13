import { useCallback, useState } from "react";
import { TerminalApp } from "../apps/TerminalApp";
import { NotesApp } from "../apps/NotesApp";
import { CalculatorApp } from "../apps/CalculatorApp";
import { SettingsApp } from "../apps/SettingsApp";
import { AboutApp } from "../apps/AboutApp";
import { FileManagerApp } from "../apps/FileManagerApp";
import { TodoApp } from "../apps/TodoApp";
import { PaintApp } from "../apps/PaintApp";
import { AudioStudioApp } from "../apps/AudioStudioApp";
import { ContactsApp } from "../apps/ContactsApp";
import { WindowFrame } from "./WindowFrame";
import { Taskbar } from "./Taskbar";
import { SplashScreen } from "./SplashScreen";
import { InstallWizard } from "./InstallWizard";
import { LoginScreen } from "./LoginScreen";
import { useUser } from "../context/UserContext";
import { APP_META, type AppId, type WindowState } from "../types";

let zCounter = 10;

const DESKTOP_FOLDERS = [
  { id: "system_utils", name: "System Utilities", icon: "🧰", category: "System Utilities" },
  { id: "productivity", name: "Productivity", icon: "💼", category: "Productivity" },
  { id: "media_creative", name: "Media & Creative", icon: "🎬", category: "Media & Creative" },
] as const;

function createWindow(appId: AppId, offset: number): WindowState {
  const meta = APP_META[appId];
  zCounter += 1;
  return {
    id: crypto.randomUUID(),
    appId,
    title: meta.title,
    x: 32 + (offset % 10) * 24,
    y: 32 + (offset % 10) * 24,
    width: meta.defaultWidth,
    height: meta.defaultHeight,
    zIndex: zCounter,
    minimized: false,
    maximized: false,
  };
}

export function Desktop() {
  const { isLoggedIn } = useUser();
  const [needsInstall, setNeedsInstall] = useState(() => {
    return !localStorage.getItem("workstation_installed");
  });
  const [booting, setBooting] = useState(true);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [systemStateMessage, setSystemStateMessage] = useState<string | null>(null);

  const openApp = useCallback((appId: AppId) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.appId === appId);
      if (existing) {
        zCounter += 1;
        setActiveWindowId(existing.id);
        return prev.map((w) =>
          w.id === existing.id
            ? { ...w, minimized: false, zIndex: zCounter }
            : w,
        );
      }
      const newWin = createWindow(appId, prev.length);
      setActiveWindowId(newWin.id);
      return [...prev, newWin];
    });
  }, []);

  const focus = (id: string) => {
    zCounter += 1;
    setActiveWindowId(id);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: zCounter } : w)),
    );
  };

  const close = (id: string) => {
    setWindows((prev) => {
      const next = prev.filter((w) => w.id !== id);
      if (activeWindowId === id) {
        const remaining = next.filter((w) => !w.minimized);
        if (remaining.length > 0) {
          const topWin = remaining.reduce((max, win) =>
            win.zIndex > max.zIndex ? win : max,
          );
          setActiveWindowId(topWin.id);
        } else {
          setActiveWindowId(null);
        }
      }
      return next;
    });
  };

  const minimize = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const toggleMaximize = (id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized } : w,
      ),
    );
  };

  const move = (id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w)),
    );
  };

  const handleTaskbarClick = (id: string) => {
    const win = windows.find((w) => w.id === id);
    if (!win) return;
    if (win.minimized) {
      zCounter += 1;
      setWindows((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, minimized: false, zIndex: zCounter } : w,
        ),
      );
      setActiveWindowId(id);
    } else if (activeWindowId === id) {
      minimize(id);
    } else {
      focus(id);
    }
  };

  const handleSystemOption = (option: "shutdown" | "restart" | "sleep") => {
    if (option === "shutdown") {
      setSystemStateMessage("It is now safe to turn off your computer.");
    } else if (option === "restart") {
      setWindows([]);
      setBooting(true);
    } else if (option === "sleep") {
      setSystemStateMessage("System in Standby mode. Click anywhere to wake up.");
    }
  };

  const renderApp = (appId: AppId, winId: string) => {
    switch (appId) {
      case "terminal":
        return <TerminalApp />;
      case "notes":
        return <NotesApp />;
      case "todo":
        return <TodoApp />;
      case "paint":
        return <PaintApp />;
      case "audiostudio":
        return <AudioStudioApp />;
      case "contacts":
        return <ContactsApp />;
      case "calculator":
        return <CalculatorApp />;
      case "settings":
        return <SettingsApp />;
      case "about":
        return <AboutApp onClose={() => close(winId)} />;
      case "filemanager":
        return <FileManagerApp onOpenFile={openApp} />;
    }
  };

  if (needsInstall) {
    return <InstallWizard onComplete={() => setNeedsInstall(false)} />;
  }

  if (booting) {
    return <SplashScreen onComplete={() => setBooting(false)} />;
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  if (systemStateMessage) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#000000",
          color: "#00ff00",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: "18px",
          textAlign: "center",
          cursor: "pointer",
        }}
        onClick={() => setSystemStateMessage(null)}
      >
        <p>{systemStateMessage}</p>
        <span style={{ fontSize: "12px", color: "#808080", marginTop: "20px" }}>
          (Click screen to resume)
        </span>
      </div>
    );
  }

  const activeFolder = DESKTOP_FOLDERS.find((f) => f.id === openFolderId);

  return (
    <div className="desktop">
      <div className="desktop-surface">
        {/* Desktop Shortcuts for Folders */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 90px)",
            gridAutoRows: "90px",
            gap: "16px",
            padding: "20px",
            position: "absolute",
            inset: 0,
            alignContent: "start",
          }}
        >
          {DESKTOP_FOLDERS.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onDoubleClick={() => setOpenFolderId(folder.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "1px transparent solid",
                boxShadow: "none",
                color: "#ffffff",
                textShadow: "1px 1px 2px #000000",
                width: "80px",
                height: "80px",
                padding: "4px",
                borderRadius: "4px",
              }}
            >
              <span style={{ fontSize: "32px", marginBottom: "4px" }}>
                {folder.icon}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  textAlign: "center",
                  wordBreak: "break-word",
                  lineHeight: "1.1",
                  fontWeight: "bold",
                }}
              >
                {folder.name}
              </span>
            </button>
          ))}
        </div>

        {/* Folder Window Viewer */}
        {activeFolder && (
          <div
            className="window active outset-border"
            style={{
              position: "absolute",
              left: "120px",
              top: "80px",
              width: "420px",
              height: "280px",
              zIndex: 9999,
              backgroundColor: "var(--dialog-bg)",
            }}
          >
            <div className="window-titlebar">
              <div className="window-title">
                <span>{activeFolder.icon}</span>
                <span>{activeFolder.name}</span>
              </div>
              <div className="window-controls">
                <button type="button" onClick={() => setOpenFolderId(null)}>
                  ✕
                </button>
              </div>
            </div>
            <div
              className="window-body inset-border"
              style={{
                backgroundColor: "#ffffff",
                margin: "4px",
                padding: "12px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, 80px)",
                gridAutoRows: "80px",
                gap: "12px",
                alignContent: "start",
              }}
            >
              {(Object.keys(APP_META) as AppId[])
                .filter(
                  (appId) =>
                    APP_META[appId].category === activeFolder.category &&
                    APP_META[appId].desktopShortcut !== false,
                )
                .map((appId) => (
                  <button
                    key={appId}
                    type="button"
                    onDoubleClick={() => {
                      openApp(appId);
                      setOpenFolderId(null);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "transparent",
                      border: "1px transparent solid",
                      color: "#000000",
                      width: "72px",
                      height: "72px",
                      padding: "4px",
                    }}
                  >
                    <span style={{ fontSize: "28px", marginBottom: "4px" }}>
                      {APP_META[appId].icon}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        textAlign: "center",
                        wordBreak: "break-word",
                        lineHeight: "1.1",
                      }}
                    >
                      {APP_META[appId].title}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Windows Rendering */}
        {windows.map((win) => (
          <WindowFrame
            key={win.id}
            win={win}
            isActive={win.id === activeWindowId && !win.minimized}
            onFocus={focus}
            onClose={close}
            onMinimize={minimize}
            onMaximize={toggleMaximize}
            onMove={move}
          >
            {renderApp(win.appId, win.id)}
          </WindowFrame>
        ))}
      </div>

      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onOpenApp={openApp}
        onWindowClick={handleTaskbarClick}
        onSystemOption={handleSystemOption}
      />
    </div>
  );
}
