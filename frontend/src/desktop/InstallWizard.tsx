import { useState } from "react";
import { useTheme, type ThemeMode } from "../context/ThemeContext";

interface Props {
  onComplete: () => void;
}

export function InstallWizard({ onComplete }: Props) {
  const { theme, setTheme, fontFamily, setFontFamily } = useTheme();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(theme);
  const [selectedFont, setSelectedFont] = useState<string>(fontFamily);

  const handleFinish = () => {
    setTheme(selectedTheme);
    setFontFamily(selectedFont);
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
          width: "480px",
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
          <span>Workstation Studio Setup Wizard (v0.0.2.5)</span>
        </div>

        {/* Wizard Header Banner */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <img src="/assets/Logo.png" alt="Logo" style={{ width: "48px", height: "48px" }} />
          <div>
            <h3 style={{ margin: 0 }}>Welcome to Workstation Studio Setup</h3>
            <span style={{ fontSize: "11px", color: "#404040" }}>
              Step {step} of 3: Configure your workstation preferences
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
              <h4 style={{ marginTop: 0 }}>Select Visual Theme</h4>
              <p style={{ fontSize: "11px" }}>
                Choose the desktop aesthetic for your workstation session:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="wizTheme"
                    checked={selectedTheme === "win95"}
                    onChange={() => setSelectedTheme("win95")}
                  />
                  <strong>Classic Desktop</strong> (Windows 95 / 98 Teal & Blue Bevels)
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

          {step === 2 && (
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
                  <option value="Tahoma, 'MS Sans Serif', sans-serif">Tahoma / MS Sans Serif</option>
                  <option value="'Courier New', monospace">Courier New (Retro Terminal)</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                </select>
              </div>
              <div style={{ marginTop: "16px", padding: "8px", border: "1px dashed #808080", fontSize: "12px" }}>
                Sample Preview: The quick brown fox jumps over the lazy dog 1234567890
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h4 style={{ marginTop: 0 }}>Setup Complete</h4>
              <p style={{ fontSize: "11px" }}>
                Workstation Studio 0.0.2.5 is configured and ready to start.
              </p>
              <ul style={{ fontSize: "11px", paddingLeft: "20px" }}>
                <li>Theme: {selectedTheme === "win95" ? "Classic Desktop" : "Ultra-Retro Windows 3.1"}</li>
                <li>Font: {selectedFont.split(",")[0]}</li>
              </ul>
              <p style={{ fontSize: "11px", color: "#404040" }}>
                Click Finish to enter your desktop. You can reconfigure options anytime in Control Panel.
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
          {step < 3 ? (
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
