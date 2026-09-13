import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { Desktop } from "./desktop/Desktop";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <UserProvider>
        <Desktop />
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
);
