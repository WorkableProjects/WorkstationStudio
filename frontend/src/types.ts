export type AppId =
  | "terminal"
  | "notes"
  | "calculator"
  | "settings"
  | "about"
  | "filemanager";

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  maximized?: boolean;
}

export const APP_META: Record<
  AppId,
  { title: string; defaultWidth: number; defaultHeight: number; icon: string }
> = {
  terminal: {
    title: "Terminal",
    defaultWidth: 640,
    defaultHeight: 400,
    icon: "💻",
  },
  notes: {
    title: "Notes",
    defaultWidth: 500,
    defaultHeight: 380,
    icon: "📝",
  },
  calculator: {
    title: "Calculator",
    defaultWidth: 260,
    defaultHeight: 320,
    icon: "🧮",
  },
  filemanager: {
    title: "File Manager",
    defaultWidth: 560,
    defaultHeight: 360,
    icon: "📁",
  },
  settings: {
    title: "Control Panel",
    defaultWidth: 420,
    defaultHeight: 320,
    icon: "⚙️",
  },
  about: {
    title: "About Workstation Studio",
    defaultWidth: 380,
    defaultHeight: 280,
    icon: "ℹ️",
  },
};
