import { useEffect, useRef } from "react";
import { APP_META, type AppId } from "../types";
import { useUser } from "../context/UserContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: AppId) => void;
  onSystemOption: (option: "shutdown" | "restart" | "sleep") => void;
}

export function StartMenu({ isOpen, onClose, onOpenApp, onSystemOption }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useUser();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const startBtn = document.querySelector(".start-button");
        if (startBtn && startBtn.contains(e.target as Node)) return;
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="start-menu" ref={menuRef}>
      <div className="start-menu-sidebar">
        <span>Workstation Studio</span>
      </div>
      <div className="start-menu-items">
        <div style={{ padding: "6px 8px", fontSize: "11px", borderBottom: "1px solid var(--border-dark)", marginBottom: "4px" }}>
          👤 User: <strong>{currentUser}</strong>
        </div>

        <button
          type="button"
          className="start-menu-item"
          onClick={() => {
            onOpenApp("settings");
            onClose();
          }}
        >
          <span>{APP_META.settings.icon}</span>
          <span>Control Panel</span>
        </button>

        <button
          type="button"
          className="start-menu-item"
          onClick={() => {
            onOpenApp("about");
            onClose();
          }}
        >
          <span>{APP_META.about.icon}</span>
          <span>About Workstation Studio</span>
        </button>

        <div className="start-menu-divider" />

        <button
          type="button"
          className="start-menu-item"
          onClick={() => {
            onSystemOption("sleep");
            onClose();
          }}
        >
          <span>🌙</span>
          <span>Stand By...</span>
        </button>

        <button
          type="button"
          className="start-menu-item"
          onClick={() => {
            onSystemOption("restart");
            onClose();
          }}
        >
          <span>🔄</span>
          <span>Restart...</span>
        </button>

        <button
          type="button"
          className="start-menu-item"
          onClick={() => {
            onSystemOption("shutdown");
            onClose();
          }}
        >
          <span>💻</span>
          <span>Shut Down...</span>
        </button>
      </div>
    </div>
  );
}
