import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext";
import { Desktop } from "./desktop/Desktop";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Desktop />
    </ThemeProvider>
  </StrictMode>,
);
