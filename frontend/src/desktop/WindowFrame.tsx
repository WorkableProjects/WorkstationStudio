import { useRef, useState, type ReactNode } from "react";
import { APP_META, type WindowState } from "../types";

interface Props {
  win: WindowState;
  isActive: boolean;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  children: ReactNode;
}

const SNAP_GRID_SIZE = 12;

export function WindowFrame({
  win,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  children,
}: Props) {
  const drag = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);

  if (win.minimized) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    onFocus(win.id);
    const target = e.target as HTMLElement;
    if (!target.closest(".window-titlebar") || target.closest("button")) return;
    if (win.maximized) return;

    drag.current = {
      ox: e.clientX,
      oy: e.clientY,
      sx: win.x,
      sy: win.y,
    };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || win.maximized) return;
    const dx = e.clientX - drag.current.ox;
    const dy = e.clientY - drag.current.oy;

    // Apply window snap-to-grid
    const rawX = Math.max(0, drag.current.sx + dx);
    const rawY = Math.max(0, drag.current.sy + dy);

    const snappedX = Math.round(rawX / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;
    const snappedY = Math.round(rawY / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;

    onMove(win.id, snappedX, snappedY);
  };

  const onPointerUp = () => {
    drag.current = null;
    setDragging(false);
  };

  const style = win.maximized
    ? {
        left: 0,
        top: 0,
        width: "100%",
        height: "calc(100vh - 30px)",
        zIndex: win.zIndex,
      }
    : {
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
      };

  return (
    <div
      className={`window ${isActive ? "active" : ""} ${dragging ? "dragging" : ""}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onMouseDown={() => onFocus(win.id)}
    >
      <div className="window-titlebar">
        <div className="window-title">
          <span>{APP_META[win.appId].icon}</span>
          <span>{win.title}</span>
        </div>
        <div className="window-controls">
          <button
            type="button"
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(win.id);
            }}
          >
            _
          </button>
          <button
            type="button"
            aria-label="Maximize"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize(win.id);
            }}
          >
            {win.maximized ? "❐" : "🗖"}
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              onClose(win.id);
            }}
          >
            ✕
          </button>
        </div>
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}
