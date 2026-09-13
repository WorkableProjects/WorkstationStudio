import { useEffect, useState, useRef } from "react";
import { APP_META, type AppId, type WindowState } from "../types";
import { StartMenu } from "./StartMenu";
import { audioManager } from "../services/audioManager";

interface Props {
  windows: WindowState[];
  activeWindowId: string | null;
  onOpenApp: (appId: AppId) => void;
  onWindowClick: (id: string) => void;
  onSystemOption: (option: "shutdown" | "restart" | "sleep") => void;
  onMinimizeWindow?: (id: string) => void;
  onMaximizeWindow?: (id: string) => void;
  onCloseWindow?: (id: string) => void;
  notificationCount?: number;
}

interface ContextMenuState {
  x: number;
  y: number;
  win: WindowState;
}

export function Taskbar({
  windows,
  activeWindowId,
  onOpenApp,
  onWindowClick,
  onSystemOption,
  onMinimizeWindow,
  onMaximizeWindow,
  onCloseWindow,
  notificationCount = 0,
}: Props) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [timeStr, setTimeStr] = useState("");
  const [connectionName, setConnectionName] = useState("Local Area Network");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateClock() {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);

    const navAny = navigator as any;
    if (navAny.connection && navAny.connection.effectiveType) {
      setConnectionName(`Network (${navAny.connection.effectiveType.toUpperCase()})`);
    } else if (navigator.onLine) {
      setConnectionName("Ethernet / Wi-Fi");
    } else {
      setConnectionName("Disconnected");
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    if (contextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, win: WindowState) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: Math.max(10, e.clientY - 110),
      win,
    });
  };

  const currentVol = Math.round(audioManager.getVolume() * 100);

  return (
    <>
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        onOpenApp={onOpenApp}
        onSystemOption={onSystemOption}
      />

      <footer className="taskbar">
        <button
          type="button"
          className={`start-button ${isStartOpen ? "pressed" : ""}`}
          onClick={() => setIsStartOpen(!isStartOpen)}
        >
          <img src="/assets/Logo.png" alt="Start" />
          <span>Start</span>
        </button>

        <div className="taskbar-items" style={{ display: "flex", gap: "2px", overflowX: "auto", flex: 1 }}>
          {windows.map((win) => {
            const isActive = win.id === activeWindowId && !win.minimized;
            return (
              <button
                key={win.id}
                type="button"
                className={`taskbar-item ${isActive ? "pressed" : ""}`}
                onClick={() => onWindowClick(win.id)}
                onContextMenu={(e) => handleContextMenu(e, win)}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  maxWidth: "160px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ marginRight: "4px" }}>
                  {APP_META[win.appId].icon}
                </span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{win.title}</span>

                {/* Taskbar app notification badge if todo/notifications active */}
                {win.appId === "todo" && notificationCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      backgroundColor: "#ff0000",
                      color: "#ffffff",
                      borderRadius: "50%",
                      fontSize: "9px",
                      fontWeight: "bold",
                      padding: "1px 4px",
                      lineHeight: "1",
                    }}
                  >
                    {notificationCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="system-tray" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 6px" }}>
          {notificationCount > 0 && (
            <span
              title={`${notificationCount} pending notifications`}
              style={{
                backgroundColor: "#ff0000",
                color: "#ffffff",
                padding: "1px 5px",
                borderRadius: "10px",
                fontSize: "10px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => onOpenApp("todo")}
            >
              🔔 {notificationCount}
            </span>
          )}
          <span title={`Connected - ${connectionName}`}>📶</span>
          <span title={`Audio - Volume at ${currentVol}%`}>🔊</span>
          <span style={{ fontSize: "11px", fontFamily: "Tahoma, sans-serif" }}>{timeStr}</span>
        </div>
      </footer>

      {/* Taskbar item right-click context menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="outset-border"
          style={{
            position: "fixed",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            backgroundColor: "var(--dialog-bg)",
            zIndex: 999999,
            padding: "2px",
            boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            minWidth: "120px",
            fontSize: "11px",
            fontFamily: "Tahoma, sans-serif",
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (onMinimizeWindow) onMinimizeWindow(contextMenu.win.id);
              setContextMenu(null);
            }}
            style={{ textAlign: "left", padding: "3px 8px", background: "transparent", border: "none" }}
          >
            {contextMenu.win.minimized ? "Restore" : "Minimize"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (onMaximizeWindow) onMaximizeWindow(contextMenu.win.id);
              setContextMenu(null);
            }}
            style={{ textAlign: "left", padding: "3px 8px", background: "transparent", border: "none" }}
          >
            {contextMenu.win.maximized ? "Restore Window" : "Maximize"}
          </button>
          <div style={{ borderTop: "1px solid var(--border-dark)", margin: "2px 0" }} />
          <button
            type="button"
            onClick={() => {
              if (onCloseWindow) onCloseWindow(contextMenu.win.id);
              setContextMenu(null);
            }}
            style={{ textAlign: "left", padding: "3px 8px", background: "transparent", border: "none", fontWeight: "bold" }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
