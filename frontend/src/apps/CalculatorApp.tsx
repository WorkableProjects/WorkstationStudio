import { useState, useRef, useEffect } from "react";
import { audioManager } from "../services/audioManager";

export function CalculatorApp() {
  const [mode, setMode] = useState<"standard" | "scientific" | "desmos">("standard");
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState<number | null>(null);
  const [newInput, setNewInput] = useState(true);
  const [isRad, setIsRad] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Graphing State
  const [graphEquation, setGraphEquation] = useState("Math.sin(x)");
  const [graphColor, setGraphColor] = useState("#0000ff");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDigit = (digit: string) => {
    if (newInput || display === "0") {
      setDisplay(digit);
      setNewInput(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    if (newInput) {
      setDisplay("0.");
      setNewInput(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setNewInput(true);
  };

  const handleBackspace = () => {
    if (newInput) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
      setNewInput(true);
    }
  };

  const appendSymbol = (sym: string) => {
    if (newInput) {
      setDisplay(sym);
      setNewInput(false);
    } else {
      setDisplay(display + sym);
    }
  };

  // Factorial helper
  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  const handleOp = (op: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;

      const angleFactor = isRad ? 1 : Math.PI / 180;
      let result = val;

      switch (op) {
        case "sin": result = Math.sin(val * angleFactor); break;
        case "cos": result = Math.cos(val * angleFactor); break;
        case "tan": result = Math.tan(val * angleFactor); break;
        case "asin": result = Math.asin(val) / angleFactor; break;
        case "acos": result = Math.acos(val) / angleFactor; break;
        case "atan": result = Math.atan(val) / angleFactor; break;
        case "sinh": result = Math.sinh(val); break;
        case "cosh": result = Math.cosh(val); break;
        case "tanh": result = Math.tanh(val); break;
        case "log": result = Math.log10(val); break;
        case "ln": result = Math.log(val); break;
        case "log2": result = Math.log2(val); break;
        case "sqrt": result = Math.sqrt(val); break;
        case "cbrt": result = Math.cbrt(val); break;
        case "sqr": result = val * val; break;
        case "cube": result = val * val * val; break;
        case "fact": result = factorial(val); break;
        case "+/-": result = -val; break;
        case "%": result = val / 100; break;
        case "pi": result = Math.PI; break;
        case "e": result = Math.E; break;
        case "phi": result = 1.61803398875; break;
      }

      if (isNaN(result) || !Number.isFinite(result)) {
        throw new Error("Invalid operation");
      }

      setDisplay(String(result));
      setNewInput(true);
    } catch {
      audioManager.playErrorSound();
      setDisplay("Error");
      setNewInput(true);
    }
  };

  const handleMemory = (op: string) => {
    const val = parseFloat(display);
    if (op === "MC") setMemory(null);
    else if (op === "MR" && memory !== null) {
      setDisplay(String(memory));
      setNewInput(true);
    } else if (op === "MS" && !isNaN(val)) {
      setMemory(val);
      setNewInput(true);
    } else if (op === "M+" && !isNaN(val)) {
      setMemory((memory || 0) + val);
      setNewInput(true);
    } else if (op === "M-" && !isNaN(val)) {
      setMemory((memory || 0) - val);
      setNewInput(true);
    }
  };

  const handleEval = () => {
    try {
      const cleanExpr = display.replace(/×/g, "*").replace(/÷/g, "/");
      if (!/^[\d+\-*/().\s]+$/.test(cleanExpr)) {
        throw new Error("Invalid expression");
      }
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${cleanExpr})`)();
      if (typeof result !== "number" || !Number.isFinite(result)) {
        throw new Error("Invalid result");
      }

      setHistory((prev) => [`${display} = ${result}`, ...prev.slice(0, 9)]);
      setDisplay(String(result));
      setNewInput(true);
    } catch {
      audioManager.playErrorSound();
      setDisplay("Error");
      setNewInput(true);
    }
  };

  // Draw Interactive Graph
  useEffect(() => {
    if (mode !== "desmos" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Plot function f(x)
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("x", `return ${graphEquation};`);
      ctx.strokeStyle = graphColor;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let isFirst = true;
      for (let px = 0; px < width; px++) {
        const x = (px - width / 2) / 30; // Scale 30px per unit
        try {
          const y = fn(x);
          const py = height / 2 - y * 30;

          if (Number.isFinite(py) && py >= -height && py <= height * 2) {
            if (isFirst) {
              ctx.moveTo(px, py);
              isFirst = false;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            isFirst = true;
          }
        } catch {
          isFirst = true;
        }
      }
      ctx.stroke();
    } catch {
      // Ignore plot errors
    }
  }, [mode, graphEquation, graphColor]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "6px",
        gap: "6px",
        backgroundColor: "var(--dialog-bg)",
        fontFamily: "Tahoma, sans-serif",
        fontSize: "11px",
      }}
    >
      {/* Mode Selector Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "2px" }}>
          <button
            type="button"
            onClick={() => setMode("standard")}
            className={mode === "standard" ? "pressed" : ""}
            style={{ fontWeight: mode === "standard" ? "bold" : "normal" }}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setMode("scientific")}
            className={mode === "scientific" ? "pressed" : ""}
            style={{ fontWeight: mode === "scientific" ? "bold" : "normal" }}
          >
            Scientific
          </button>
          <button
            type="button"
            onClick={() => setMode("desmos")}
            className={mode === "desmos" ? "pressed" : ""}
            style={{ fontWeight: mode === "desmos" ? "bold" : "normal" }}
          >
            Desmos Graphing
          </button>
        </div>

        {mode === "scientific" && (
          <button
            type="button"
            onClick={() => setIsRad(!isRad)}
            style={{ fontSize: "10px", fontWeight: "bold" }}
          >
            {isRad ? "RAD" : "DEG"}
          </button>
        )}
      </div>

      {/* Standard / Scientific Modes */}
      {mode !== "desmos" ? (
        <>
          {/* Display & Memory Status */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", padding: "0 2px" }}>
            <div
              className="inset-border"
              style={{ width: "24px", height: "18px", textAlign: "center", fontWeight: "bold", background: "#fff" }}
            >
              {memory !== null ? "M" : ""}
            </div>
            <div style={{ color: "#606060" }}>{mode.toUpperCase()} MODE</div>
          </div>

          <div
            className="inset-border"
            style={{
              background: "#ffffff",
              padding: "4px 8px",
              textAlign: "right",
              fontSize: "16px",
              fontWeight: "bold",
              fontFamily: "Courier New, monospace",
              height: "36px",
              lineHeight: "26px",
              overflow: "hidden",
            }}
          >
            {display}
          </div>

          {/* Keypad */}
          <div style={{ display: "grid", gridTemplateColumns: mode === "scientific" ? "repeat(7, 1fr)" : "repeat(5, 1fr)", gap: "4px", flex: 1 }}>
            {/* Memory & Basic Row 1 */}
            <button type="button" onClick={() => handleMemory("MC")}>MC</button>
            <button type="button" onClick={() => handleMemory("MR")}>MR</button>
            <button type="button" onClick={() => handleMemory("MS")}>MS</button>
            <button type="button" onClick={() => handleMemory("M+")}>M+</button>
            <button type="button" onClick={handleClear}>C</button>
            {mode === "scientific" && (
              <>
                <button type="button" onClick={() => handleOp("sin")}>sin</button>
                <button type="button" onClick={() => handleOp("cos")}>cos</button>
              </>
            )}

            {/* Row 2 */}
            <button type="button" onClick={handleBackspace}>←</button>
            <button type="button" onClick={() => handleDigit("7")}>7</button>
            <button type="button" onClick={() => handleDigit("8")}>8</button>
            <button type="button" onClick={() => handleDigit("9")}>9</button>
            <button type="button" onClick={() => appendSymbol(" / ")}>/</button>
            {mode === "scientific" && (
              <>
                <button type="button" onClick={() => handleOp("tan")}>tan</button>
                <button type="button" onClick={() => handleOp("asin")}>asin</button>
              </>
            )}

            {/* Row 3 */}
            <button type="button" onClick={() => handleOp("+/-")}>+/-</button>
            <button type="button" onClick={() => handleDigit("4")}>4</button>
            <button type="button" onClick={() => handleDigit("5")}>5</button>
            <button type="button" onClick={() => handleDigit("6")}>6</button>
            <button type="button" onClick={() => appendSymbol(" * ")}>*</button>
            {mode === "scientific" && (
              <>
                <button type="button" onClick={() => handleOp("log")}>log</button>
                <button type="button" onClick={() => handleOp("ln")}>ln</button>
              </>
            )}

            {/* Row 4 */}
            <button type="button" onClick={() => handleOp("sqrt")}>√</button>
            <button type="button" onClick={() => handleDigit("1")}>1</button>
            <button type="button" onClick={() => handleDigit("2")}>2</button>
            <button type="button" onClick={() => handleDigit("3")}>3</button>
            <button type="button" onClick={() => appendSymbol(" - ")}>-</button>
            {mode === "scientific" && (
              <>
                <button type="button" onClick={() => handleOp("sqr")}>x²</button>
                <button type="button" onClick={() => handleOp("fact")}>n!</button>
              </>
            )}

            {/* Row 5 */}
            <button type="button" onClick={() => handleOp("%")}>%</button>
            <button type="button" onClick={() => handleDigit("0")}>0</button>
            <button type="button" onClick={handleDecimal}>.</button>
            <button type="button" onClick={() => appendSymbol(" + ")}>+</button>
            <button type="button" onClick={handleEval} style={{ fontWeight: "bold" }}>=</button>
            {mode === "scientific" && (
              <>
                <button type="button" onClick={() => handleOp("pi")}>π</button>
                <button type="button" onClick={() => handleOp("e")}>e</button>
              </>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="inset-border" style={{ backgroundColor: "#ffffff", padding: "4px", height: "50px", overflowY: "auto", fontSize: "10px" }}>
              <div style={{ fontWeight: "bold", color: "#606060" }}>History:</div>
              {history.map((h, i) => (
                <div key={i}>{h}</div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Desmos Graphing Calculator Mode */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span>f(x) =</span>
            <input
              type="text"
              value={graphEquation}
              onChange={(e) => setGraphEquation(e.target.value)}
              placeholder="e.g. Math.sin(x) or Math.cos(x)"
              style={{ flex: 1, fontFamily: "monospace" }}
            />
            <select value={graphColor} onChange={(e) => setGraphColor(e.target.value)}>
              <option value="#0000ff">Blue</option>
              <option value="#ff0000">Red</option>
              <option value="#008000">Green</option>
              <option value="#ff00ff">Purple</option>
            </select>
          </div>

          {/* Canvas Interactive Plotter */}
          <div className="inset-border" style={{ flex: 1, backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <canvas ref={canvasRef} width={380} height={220} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      )}
    </div>
  );
}
