import { useEffect, useState } from "react";
import { APP_META, type AppId, type WindowState } from "../types";
import { StartMenu } from "./StartMenu";
import { audioManager } from "../services/audioManager";

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
  const [connectionName, setConnectionName] = useState("Local Area Network");

  useEffect(() => {
    function updateClock() {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);

    // Pull system network connection name if available
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
          <span title={`Connected - ${connectionName}`}>📶</span>
          <span title={`Audio - Volume at ${currentVol}%`}>🔊</span>
          <span>{timeStr}</span>
        </div>
      </footer>
    </>
  );
}
