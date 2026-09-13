import packageJson from "../../package.json";
import { useTheme } from "../context/ThemeContext";

interface Props {
  onClose?: () => void;
}

export function AboutApp({ onClose }: Props) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "12px",
        gap: "12px",
        backgroundColor: "var(--dialog-bg)",
        fontFamily: "Tahoma, sans-serif",
        fontSize: "11px",
      }}
    >
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <img
          src="/assets/Logo.png"
          alt="Workstation Studio"
          style={{ width: "48px", height: "48px" }}
        />
        <div>
          <h2 style={{ margin: "0 0 2px 0", fontSize: "16px", fontWeight: "bold" }}>
            Workstation Studio
          </h2>
          <div style={{ color: "var(--dialog-fg)" }}>Version {packageJson.version}</div>
        </div>
      </div>

      <div
        className="inset-border"
        style={{
          flex: 1,
          backgroundColor: "var(--dialog-bg)",
          color: "var(--dialog-fg)",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          overflowY: "auto",
        }}
      >
        <div>
          <strong>System:</strong> Web-based OS Shell
        </div>
        <div>
          <strong>Current Theme:</strong> {theme.toUpperCase()}
        </div>
        <div>
          <strong>Display Resolution:</strong> {window.innerWidth} × {window.innerHeight}
        </div>
        <div>
          <strong>Build Date:</strong> {new Date().toLocaleDateString()}
        </div>
        <div>
          <strong>License:</strong> MIT License
        </div>

        <hr style={{ borderColor: "var(--border-dark)", width: "100%", margin: "4px 0" }} />

        <div>
          <strong>Links:</strong>
          <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
            <li>
              <a
                href="https://github.com/swebench/workstation-studio"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#0000ff" }}
              >
                Project Repository
              </a>
            </li>
            <li>
              <a
                href="https://github.com/swebench/workstation-studio/blob/main/README.md"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#0000ff" }}
              >
                Documentation & Help
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onClose}
          style={{ width: "75px", fontWeight: "bold" }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
