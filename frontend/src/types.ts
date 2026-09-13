export type AppId =
  | "terminal"
  | "notes"
  | "calculator"
  | "settings"
  | "about"
  | "filemanager"
  | "todo"
  | "paint"
  | "audiostudio"
  | "contacts";

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
  {
    title: string;
    defaultWidth: number;
    defaultHeight: number;
    icon: string;
    category: "System Utilities" | "Productivity" | "Media & Creative";
    desktopShortcut?: boolean;
  }
> = {
  terminal: {
    title: "Workstation CLI",
    defaultWidth: 640,
    defaultHeight: 400,
    icon: "💻",
    category: "System Utilities",
    desktopShortcut: true,
  },
  filemanager: {
    title: "File Manager",
    defaultWidth: 560,
    defaultHeight: 360,
    icon: "📁",
    category: "System Utilities",
    desktopShortcut: true,
  },
  settings: {
    title: "Control Panel",
    defaultWidth: 460,
    defaultHeight: 340,
    icon: "⚙️",
    category: "System Utilities",
    desktopShortcut: true,
  },
  about: {
    title: "About Workstation Studio",
    defaultWidth: 380,
    defaultHeight: 280,
    icon: "ℹ️",
    category: "System Utilities",
    desktopShortcut: false,
  },
  notes: {
    title: "Notes",
    defaultWidth: 500,
    defaultHeight: 380,
    icon: "📝",
    category: "Productivity",
    desktopShortcut: true,
  },
  todo: {
    title: "Tasks & Todo",
    defaultWidth: 380,
    defaultHeight: 340,
    icon: "✅",
    category: "Productivity",
    desktopShortcut: true,
  },
  contacts: {
    title: "Contacts",
    defaultWidth: 420,
    defaultHeight: 320,
    icon: "🎴",
    category: "Productivity",
    desktopShortcut: true,
  },
  calculator: {
    title: "Calculator",
    defaultWidth: 260,
    defaultHeight: 320,
    icon: "🧮",
    category: "Productivity",
    desktopShortcut: true,
  },
  paint: {
    title: "Studio Paint",
    defaultWidth: 500,
    defaultHeight: 380,
    icon: "🎨",
    category: "Media & Creative",
    desktopShortcut: true,
  },
  audiostudio: {
    title: "Sound Recorder",
    defaultWidth: 460,
    defaultHeight: 320,
    icon: "🎙️",
    category: "Media & Creative",
    desktopShortcut: true,
  },
};
