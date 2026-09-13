import { useEffect, useRef, useState } from "react";
import { useUser } from "../context/UserContext";

export function PaintApp() {
  const { getUserStorageItem, setUserStorageItem, currentUser } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load saved image from user browser storage
    const savedImg = getUserStorageItem("paint_artwork");
    if (savedImg) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = savedImg;
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [currentUser]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Save to user browser storage
    const canvas = canvasRef.current;
    if (canvas) {
      setUserStorageItem("paint_artwork", canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setUserStorageItem("paint_artwork", canvas.toDataURL());
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "6px",
        gap: "6px",
        backgroundColor: "var(--dialog-bg)",
      }}
    >
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
          Color:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: "28px", height: "22px", padding: 0, border: "none" }}
          />
        </label>

        <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
          Size:
          <select
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            style={{ fontSize: "11px" }}
          >
            <option value={1}>1px</option>
            <option value={3}>3px</option>
            <option value={6}>6px</option>
            <option value={12}>12px</option>
          </select>
        </label>

        <button type="button" onClick={clearCanvas} style={{ fontSize: "11px" }}>
          Clear Canvas
        </button>
      </div>

      <div
        className="inset-border"
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          width={460}
          height={300}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ cursor: "crosshair" }}
        />
      </div>
    </div>
  );
}
