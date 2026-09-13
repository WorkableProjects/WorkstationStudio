import { useEffect } from "react";
import { audioManager } from "../services/audioManager";

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  taskId?: string;
  createdAt: number;
}

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  onSelectTask?: (taskId: string) => void;
}

export function NotificationToast({ toasts, onDismiss, onSelectTask }: Props) {
  useEffect(() => {
    if (toasts.length > 0) {
      audioManager.playErrorSound();
    }
  }, [toasts.length]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "38px",
        right: "12px",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        maxWidth: "280px",
        fontFamily: "Tahoma, sans-serif",
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="outset-border"
          style={{
            backgroundColor: "#ffffd0",
            color: "#000000",
            padding: "8px 10px",
            boxShadow: "2px 2px 8px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            animation: "startMenuSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "bold" }}>
            <span>⏰ {toast.title}</span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              style={{ padding: "0 4px", fontSize: "9px" }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: "11px" }}>{toast.message}</div>
          {toast.taskId && onSelectTask && (
            <button
              type="button"
              onClick={() => {
                onSelectTask(toast.taskId!);
                onDismiss(toast.id);
              }}
              style={{ fontSize: "10px", marginTop: "4px", alignSelf: "flex-end" }}
            >
              View Task
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
