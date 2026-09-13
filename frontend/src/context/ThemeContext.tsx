import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "win95" | "win31" | "tealtech";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
}

const STORAGE_KEY_THEME = "workstation_studio_theme";
const STORAGE_KEY_FONT = "workstation_studio_font";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode | null;
    if (saved === "win95" || saved === "win31" || saved === "tealtech") {
      return saved;
    }
    return "tealtech"; // Default to new Teal-Tech modern theme
  });

  const [fontFamily, setFontFamilyState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_FONT) || "Segoe UI, sans-serif";
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
  };

  const setFontFamily = (font: string) => {
    setFontFamilyState(font);
    localStorage.setItem(STORAGE_KEY_FONT, font);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.setProperty("--font-family", fontFamily);
    if (fontFamily.includes("Times New Roman")) {
      document.documentElement.style.setProperty("--font-size", "14px");
    } else {
      document.documentElement.style.setProperty("--font-size", "11px");
    }
  }, [theme, fontFamily]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontFamily, setFontFamily }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "tealtech" as ThemeMode,
      setTheme: () => {},
      fontFamily: "Segoe UI, sans-serif",
      setFontFamily: () => {},
    };
  }
  return context;
}
