import { useRef, useState, type ReactNode } from "react";
import type { WindowState } from "../types";

interface Props {
  win: WindowState;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  children: ReactNode;
}

export function WindowFrame({
  win,
  onFocus,
  onClose,
  onMinimize,
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
    if (!drag.current) return;
    const dx = e.clientX - drag.current.ox;
    const dy = e.clientY - drag.current.oy;
    onMove(
      win.id,
      Math.max(0, drag.current.sx + dx),
      Math.max(0, drag.current.sy + dy),
    );
  };

  const onPointerUp = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <div
      className={`window ${dragging ? "dragging" : ""}`}
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onMouseDown={() => onFocus(win.id)}
    >
      <div className="window-titlebar">
        <span className="window-title">{win.title}</span>
        <div className="window-controls">
          <button type="button" aria-label="Minimize" onClick={() => onMinimize(win.id)}>
            –
          </button>
          <button type="button" aria-label="Close" onClick={() => onClose(win.id)}>
            ×
          </button>
        </div>
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}
