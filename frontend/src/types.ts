export type AppId = "terminal" | "notes" | "calculator";

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
}

export const APP_META: Record<
  AppId,
  { title: string; defaultWidth: number; defaultHeight: number }
> = {
  terminal: { title: "Terminal", defaultWidth: 720, defaultHeight: 440 },
  notes: { title: "Notes", defaultWidth: 480, defaultHeight: 420 },
  calculator: { title: "Calculator", defaultWidth: 280, defaultHeight: 380 },
};
