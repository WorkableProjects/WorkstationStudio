export interface StartupConfig {
  durationMs: number;
  progressSteps: { progress: number; message: string }[];
}

export const STARTUP_CONFIG: StartupConfig = {
  durationMs: 3500,
  progressSteps: [
    { progress: 10, message: "Initializing System BIOS..." },
    { progress: 30, message: "Loading Workstation Studio Kernel..." },
    { progress: 55, message: "Mounting Virtual File System..." },
    { progress: 80, message: "Starting Desktop Environment..." },
    { progress: 100, message: "Welcome to Workstation Studio 0.0.2" },
  ],
};
