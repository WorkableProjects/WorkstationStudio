import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { audioManager } from "../services/audioManager";

export function SettingsApp() {
  const { theme, setTheme, fontFamily, setFontFamily } = useTheme();
  const [activeTab, setActiveTab] = useState<"appearance" | "sound" | "system">(
    "appearance",
  );

  const [volume, setVolumeState] = useState(audioManager.getVolume() * 100);
  const [isMuted, setIsMutedState] = useState(audioManager.isMuted());

  const handleVolumeChange = (v: number) => {
    setVolumeState(v);
    audioManager.setVolume(v / 100);
  };

  const handleMuteToggle = (muted: boolean) => {
    setIsMutedState(muted);
    audioManager.setMuted(muted);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "6px",
        gap: "6px",
        backgroundColor: "var(--dialog-bg)",
        fontFamily: "Tahoma, sans-serif",
      }}
    >
      {/* Property Sheet Tabs */}
      <div style={{ display: "flex", gap: "2px", borderBottom: "1px solid var(--border-dark)" }}>
        <button
          type="button"
          className={activeTab === "appearance" ? "pressed" : ""}
          onClick={() => setActiveTab("appearance")}
          style={{ fontSize: "11px" }}
        >
          Appearance
        </button>
        <button
          type="button"
          className={activeTab === "sound" ? "pressed" : ""}
          onClick={() => setActiveTab("sound")}
          style={{ fontSize: "11px" }}
        >
          Sound & Audio
        </button>
        <button
          type="button"
          className={activeTab === "system" ? "pressed" : ""}
          onClick={() => setActiveTab("system")}
          style={{ fontSize: "11px" }}
        >
          System
        </button>
      </div>

      {/* Tab Content Body */}
      <div
        className="outset-border"
        style={{
          flex: 1,
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          overflowY: "auto",
        }}
      >
        {activeTab === "appearance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <fieldset
              style={{
                border: "1px solid var(--border-dark)",
                padding: "8px 12px",
                margin: 0,
              }}
            >
              <legend style={{ fontSize: "11px", padding: "0 4px" }}>
                Desktop Theme Scheme
              </legend>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === "win95"}
                    onChange={() => setTheme("win95")}
                  />
                  Classic Desktop (Windows 95 / 98)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === "win31"}
                    onChange={() => setTheme("win31")}
                  />
                  Ultra-Retro Windows 3.1 (High Contrast Monochrome)
                </label>
              </div>
            </fieldset>

            <fieldset
              style={{
                border: "1px solid var(--border-dark)",
                padding: "8px 12px",
                margin: 0,
              }}
            >
              <legend style={{ fontSize: "11px", padding: "0 4px" }}>
                System Font
              </legend>
              <div style={{ marginTop: "4px" }}>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="Tahoma, 'MS Sans Serif', sans-serif">Tahoma / MS Sans Serif</option>
                  <option value="'Courier New', monospace">Courier New (Retro Terminal)</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                </select>
              </div>
            </fieldset>
          </div>
        )}

        {activeTab === "sound" && (
          <div>
            <fieldset
              style={{
                border: "1px solid var(--border-dark)",
                padding: "8px 12px",
                margin: 0,
              }}
            >
              <legend style={{ fontSize: "11px", padding: "0 4px" }}>
                Error Sound Configuration
              </legend>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginTop: "4px",
                }}
              >
                <div>
                  <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>
                    Volume: {Math.round(volume)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="checkbox"
                    checked={isMuted}
                    onChange={(e) => handleMuteToggle(e.target.checked)}
                  />
                  Mute Error Sounds
                </label>

                <div>
                  <button
                    type="button"
                    onClick={() => audioManager.playErrorSound()}
                    style={{ fontSize: "11px" }}
                  >
                    🔊 Test Error Sound
                  </button>
                </div>
              </div>
            </fieldset>
          </div>
        )}

        {activeTab === "system" && (
          <div>
            <fieldset
              style={{
                border: "1px solid var(--border-dark)",
                padding: "8px 12px",
                margin: 0,
              }}
            >
              <legend style={{ fontSize: "11px", padding: "0 4px" }}>
                System Display & Environment Details
              </legend>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "11px",
                  wordBreak: "break-all",
                  whiteSpace: "normal",
                  overflowWrap: "break-word",
                }}
              >
                <div><strong>Resolution:</strong> {window.innerWidth} × {window.innerHeight}</div>
                <div><strong>Color Depth:</strong> {window.screen.colorDepth}-bit</div>
                <div><strong>Language:</strong> {navigator.language}</div>
                <div><strong>User Agent:</strong></div>
                <div
                  className="inset-border"
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "6px",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    maxHeight: "120px",
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {navigator.userAgent}
                </div>
              </div>
            </fieldset>
          </div>
        )}
      </div>
    </div>
  );
}
