import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "win95" | "win31";

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
    if (saved === "win95" || saved === "win31") {
      return saved;
    }
    return "win95"; // Combined Windows 95/98 theme
  });

  const [fontFamily, setFontFamilyState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_FONT) || "Tahoma, 'MS Sans Serif', sans-serif";
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
      theme: "win95" as ThemeMode,
      setTheme: () => {},
      fontFamily: "Tahoma, 'MS Sans Serif', sans-serif",
      setFontFamily: () => {},
    };
  }
  return context;
}
