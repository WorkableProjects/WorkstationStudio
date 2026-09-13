import { useEffect, useState } from "react";
import packageJson from "../../package.json";
import { STARTUP_CONFIG } from "../config/startup";
import { audioManager } from "../services/audioManager";

interface Props {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(STARTUP_CONFIG.progressSteps[0]?.message || "Starting...");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("skip-splash") || urlParams.get("splash") === "false") {
      onComplete();
      return;
    }

    const totalSteps = STARTUP_CONFIG.progressSteps;
    const intervalTime = STARTUP_CONFIG.durationMs / 100;

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      const matchedStep = [...totalSteps].reverse().find((s) => s.progress <= currentProgress);
      if (matchedStep) {
        setStatusMessage(matchedStep.message);
      }

      if (currentProgress >= 100) {
        clearInterval(timer);
        setTimeout(onComplete, 400);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  const triggerStartupError = () => {
    setHasError(true);
    audioManager.playErrorSound();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000000",
        color: "#ffffff",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Tahoma, 'MS Sans Serif', sans-serif",
      }}
    >
      {!hasError ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "360px",
            textAlign: "center",
          }}
        >
          <img
            src="/assets/Logo.png"
            alt="Workstation Studio"
            style={{ width: "64px", height: "64px", marginBottom: "16px" }}
          />
          <h1 style={{ fontSize: "24px", margin: "0 0 4px 0", fontWeight: "bold" }}>
            Workstation Studio
          </h1>
          <div style={{ fontSize: "14px", color: "#c0c0c0", marginBottom: "32px" }}>
            Version v{packageJson.version}
          </div>

          <div
            style={{
              width: "100%",
              height: "20px",
              backgroundColor: "#c0c0c0",
              border: "2px solid #ffffff",
              padding: "2px",
              boxSizing: "border-box",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#000080",
                transition: "width 0.1s linear",
              }}
            />
          </div>

          <div style={{ fontSize: "11px", color: "#a0a0a0", minHeight: "16px" }}>
            {statusMessage}
          </div>

          <button
            type="button"
            onClick={triggerStartupError}
            style={{
              marginTop: "40px",
              fontSize: "10px",
              opacity: 0.3,
              background: "transparent",
              color: "#808080",
              border: "none",
            }}
          >
            [Simulate Boot Fault]
          </button>
        </div>
      ) : (
        <div
          className="outset-border"
          style={{
            backgroundColor: "#c0c0c0",
            color: "#000000",
            padding: "16px",
            width: "320px",
            boxShadow: "4px 4px 10px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              backgroundColor: "#000080",
              color: "#ffffff",
              padding: "2px 6px",
              fontWeight: "bold",
              marginBottom: "12px",
            }}
          >
            System Error
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "24px", color: "red", fontWeight: "bold" }}>❌</span>
            <p style={{ margin: 0, fontSize: "12px" }}>
              A fatal startup exception has occurred. Click Retry to reload.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <button
              type="button"
              onClick={() => {
                setHasError(false);
                setProgress(0);
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
