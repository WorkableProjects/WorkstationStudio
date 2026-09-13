import { useEffect, useState } from "react";
import { APP_META, type AppId, type WindowState } from "../types";
import { StartMenu } from "./StartMenu";

interface Props {
  windows: WindowState[];
  activeWindowId: string | null;
  onOpenApp: (appId: AppId) => void;
  onWindowClick: (id: string) => void;
  onSystemOption: (option: "shutdown" | "restart" | "sleep") => void;
}

export function Taskbar({
  windows,
  activeWindowId,
  onOpenApp,
  onWindowClick,
  onSystemOption,
}: Props) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    function updateClock() {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

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

        <div className="taskbar-items">
          {windows.map((win) => {
            const isActive = win.id === activeWindowId && !win.minimized;
            return (
              <button
                key={win.id}
                type="button"
                className={`taskbar-item ${isActive ? "pressed" : ""}`}
                onClick={() => onWindowClick(win.id)}
              >
                <span style={{ marginRight: "4px" }}>
                  {APP_META[win.appId].icon}
                </span>
                <span>{win.title}</span>
              </button>
            );
          })}
        </div>

        <div className="system-tray">
          <span title="Network status: Connected">📶</span>
          <span title="Volume: Active">🔊</span>
          <span>{timeStr}</span>
        </div>
      </footer>
    </>
  );
}
