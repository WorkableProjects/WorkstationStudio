import { useEffect, useRef, useState, useMemo } from "react";
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { currentUser, logout } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [recentApps, setRecentApps] = useState<AppId[]>(() => {
    try {
      const saved = localStorage.getItem("workstation_recent_apps");
      return saved ? JSON.parse(saved) : ["terminal", "filemanager", "notes"];
    } catch {
      return ["terminal", "filemanager", "notes"];
    }
  });

  const handleLaunchApp = (appId: AppId) => {
    const updatedRecents = [appId, ...recentApps.filter((id) => id !== appId)].slice(0, 4);
    setRecentApps(updatedRecents);
    localStorage.setItem("workstation_recent_apps", JSON.stringify(updatedRecents));

    onOpenApp(appId);
    onClose();
  };

  const allApps = useMemo(() => {
    return (Object.keys(APP_META) as AppId[]).map((id) => ({
      id,
      ...APP_META[id],
    }));
  }, []);

  const filteredApps = useMemo(() => {
    if (!searchTerm.trim()) return allApps;
    const term = searchTerm.toLowerCase();
    return allApps.filter((app) =>
      app.title.toLowerCase().includes(term) || app.category.toLowerCase().includes(term)
    );
  }, [allApps, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredApps.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredApps.length) % Math.max(1, filteredApps.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredApps[selectedIndex]) {
        handleLaunchApp(filteredApps[selectedIndex].id);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="start-menu outset-border"
      ref={menuRef}
      onKeyDown={handleKeyDown}
      style={{
        position: "absolute",
        bottom: "32px",
        left: "2px",
        width: "280px",
        backgroundColor: "var(--dialog-bg)",
        color: "var(--dialog-fg)",
        display: "flex",
        boxShadow: "3px -3px 10px rgba(0,0,0,0.4)",
        zIndex: 99999,
        fontFamily: "Tahoma, sans-serif",
      }}
    >
      <div
        className="start-menu-sidebar"
        style={{
          width: "28px",
          background: "linear-gradient(to top, #000080, #1084d0)",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: "14px",
          letterSpacing: "1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "8px 2px",
        }}
      >
        <span>Workstation Studio</span>
      </div>

      <div
        className="start-menu-items"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "4px",
          gap: "2px",
        }}
      >
        <div
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            borderBottom: "1px solid var(--border-dark)",
            marginBottom: "2px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>User: <strong>{currentUser}</strong></span>
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            style={{ fontSize: "10px", padding: "1px 4px" }}
          >
            Log Off
          </button>
        </div>

        <div style={{ padding: "2px 4px" }}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              fontSize: "11px",
              padding: "2px 4px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {!searchTerm.trim() && (
          <div style={{ margin: "2px 0", borderBottom: "1px solid var(--border-dark)", paddingBottom: "2px" }}>
            <div style={{ fontSize: "10px", opacity: 0.8, padding: "2px 6px", fontWeight: "bold" }}>
              RECENT APPLICATIONS
            </div>
            {recentApps.map((id) => {
              const meta = APP_META[id];
              if (!meta) return null;
              return (
                <button
                  key={`recent-${id}`}
                  type="button"
                  className="start-menu-item"
                  onClick={() => handleLaunchApp(id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    textAlign: "left",
                    padding: "4px 8px",
                    fontSize: "11px",
                    border: "none",
                    background: "transparent",
                    color: "var(--dialog-fg)",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{meta.icon}</span>
                  <span style={{ fontWeight: 600 }}>{meta.title}</span>
                </button>
              );
            })}
          </div>
        )}

        <div
          style={{
            maxHeight: "220px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
          }}
        >
          <div style={{ fontSize: "10px", opacity: 0.8, padding: "2px 6px", fontWeight: "bold" }}>
            {searchTerm.trim() ? "SEARCH RESULTS" : "ALL PROGRAMS"}
          </div>
          {filteredApps.map((app, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={app.id}
                type="button"
                className={`start-menu-item ${isSelected ? "focused" : ""}`}
                onClick={() => handleLaunchApp(app.id)}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  textAlign: "left",
                  padding: "4px 8px",
                  fontSize: "11px",
                  border: "none",
                  backgroundColor: isSelected ? "var(--title-bg-active)" : "transparent",
                  color: isSelected ? "var(--title-fg-active)" : "var(--dialog-fg)",
                  cursor: "pointer",
                  borderRadius: "0px",
                }}
              >
                <span style={{ fontSize: "14px" }}>{app.icon}</span>
                <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>{app.title}</span>
              </button>
            );
          })}
          {filteredApps.length === 0 && (
            <div style={{ padding: "8px", fontSize: "11px", opacity: 0.7, textAlign: "center" }}>
              No matching applications
            </div>
          )}
        </div>

        <div className="start-menu-divider" style={{ borderTop: "1px solid var(--border-dark)", margin: "4px 0" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <button
            type="button"
            className="start-menu-item"
            onClick={() => {
              onSystemOption("sleep");
              onClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 8px",
              fontSize: "11px",
              border: "none",
              background: "transparent",
              color: "var(--dialog-fg)",
              cursor: "pointer",
              textAlign: "left",
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 8px",
              fontSize: "11px",
              border: "none",
              background: "transparent",
              color: "var(--dialog-fg)",
              cursor: "pointer",
              textAlign: "left",
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 8px",
              fontSize: "11px",
              border: "none",
              background: "transparent",
              color: "var(--dialog-fg)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span>💻</span>
            <span>Shut Down...</span>
          </button>
        </div>
      </div>
    </div>
  );
}
