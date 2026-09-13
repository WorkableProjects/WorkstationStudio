import { useState } from "react";
import { useTheme, type ThemeMode } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

interface Props {
  onComplete: () => void;
}

export function InstallWizard({ onComplete }: Props) {
  const { theme, setTheme, fontFamily, setFontFamily } = useTheme();
  const { createUser } = useUser();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(theme);
  const [selectedFont, setSelectedFont] = useState<string>(fontFamily);
  const [usernameInput, setUsernameInput] = useState("studio_user");

  const handleFinish = () => {
    setTheme(selectedTheme);
    setFontFamily(selectedFont);
    createUser(usernameInput || "studio_user");
    localStorage.setItem("workstation_installed", "true");
    onComplete();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#008080",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        fontFamily: selectedFont,
      }}
    >
      <div
        className="outset-border"
        style={{
          width: "500px",
          backgroundColor: "var(--dialog-bg)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "4px 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        {/* Wizard Titlebar */}
        <div
          style={{
            backgroundColor: "#000080",
            color: "#ffffff",
            padding: "4px 8px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Workstation Studio Setup Wizard (v0.0.2.6.6)</span>
        </div>

        {/* Wizard Header Banner */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <img src="/assets/Logo.png" alt="Logo" style={{ width: "48px", height: "48px" }} />
          <div>
            <h3 style={{ margin: 0 }}>Welcome to Workstation Studio Setup</h3>
            <span style={{ fontSize: "11px", color: "#404040" }}>
              Step {step} of 4: Configure user account and preferences
            </span>
          </div>
        </div>

        <hr style={{ borderTop: "1px solid var(--border-dark)", margin: 0 }} />

        {/* Step Content */}
        <div
          className="inset-border"
          style={{
            backgroundColor: "#ffffff",
            padding: "12px",
            minHeight: "180px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {step === 1 && (
            <div>
              <h4 style={{ marginTop: 0 }}>Create Primary User Account</h4>
              <p style={{ fontSize: "11px" }}>
                Enter your username. Your personal files and app state will be stored under
                <code>.studio/&lt;username&gt;</code> in browser storage.
              </p>
              <div style={{ marginTop: "12px" }}>
                <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>
                  Username:
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. jules_dev"
                  style={{ width: "100%", padding: "4px" }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h4 style={{ marginTop: 0 }}>Select Visual Theme</h4>
              <p style={{ fontSize: "11px" }}>
                Choose the desktop aesthetic for your workstation session:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="wizTheme"
                    checked={selectedTheme === "tealtech"}
                    onChange={() => setSelectedTheme("tealtech")}
                  />
                  <strong>Modern Teal-Tech</strong> (Dark Cyan Glass & High Contrast Logo)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="wizTheme"
                    checked={selectedTheme === "win95"}
                    onChange={() => setSelectedTheme("win95")}
                  />
                  <strong>Classic Desktop</strong> (Windows 95 / 98)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="wizTheme"
                    checked={selectedTheme === "win31"}
                    onChange={() => setSelectedTheme("win31")}
                  />
                  <strong>Ultra-Retro Windows 3.1</strong> (High Contrast Monochrome)
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h4 style={{ marginTop: 0 }}>Select Typography Font</h4>
              <p style={{ fontSize: "11px" }}>
                Select your default system font preference:
              </p>
              <div style={{ marginTop: "8px" }}>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  style={{ width: "100%", padding: "4px" }}
                >
                  <option value="Segoe UI, sans-serif">Segoe UI (Modern Tech)</option>
                  <option value="Tahoma, 'MS Sans Serif', sans-serif">Tahoma / MS Sans Serif</option>
                  <option value="'Courier New', monospace">Courier New (Terminal)</option>
                  <option value="'Times New Roman', serif">Times New Roman (Large)</option>
                </select>
              </div>
              <div style={{ marginTop: "16px", padding: "8px", border: "1px dashed #808080", fontSize: "12px" }}>
                Sample Preview: The quick brown fox jumps over the lazy dog 1234567890
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h4 style={{ marginTop: 0 }}>Setup Complete</h4>
              <p style={{ fontSize: "11px" }}>
                Workstation Studio 0.0.2.6.6 is configured and ready to start.
              </p>
              <ul style={{ fontSize: "11px", paddingLeft: "20px" }}>
                <li>User Directory: .studio/{usernameInput || "studio_user"}</li>
                <li>Theme: {selectedTheme}</li>
                <li>Font: {selectedFont.split(",")[0]}</li>
              </ul>
              <p style={{ fontSize: "11px", color: "#404040" }}>
                Click Finish to enter your desktop.
              </p>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          {step > 1 && (
            <button type="button" onClick={() => setStep((step - 1) as any)}>
              &lt; Back
            </button>
          )}
          {step < 4 ? (
            <button type="button" onClick={() => setStep((step + 1) as any)}>
              Next &gt;
            </button>
          ) : (
            <button type="button" onClick={handleFinish} style={{ fontWeight: "bold" }}>
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
