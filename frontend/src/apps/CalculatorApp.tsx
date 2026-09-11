import { useState } from "react";

function evaluate(expr: string): string {
  const cleaned = expr.replace(/\s+/g, "");
  if (!/^[\d+\-*/().%]+$/.test(cleaned)) return "Error";
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${cleaned})`)();
    if (typeof result !== "number" || !Number.isFinite(result)) return "Error";
    return String(result);
  } catch {
    return "Error";
  }
}

const KEYS = [
  ["C", "⌫", "%", "/"],
  ["7", "8", "9", "*"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", ".", "=", ""],
] as const;

export function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");

  const press = (key: string) => {
    if (!key) return;
    if (key === "C") {
      setDisplay("0");
      setExpr("");
      return;
    }
    if (key === "⌫") {
      const next = expr.slice(0, -1);
      setExpr(next);
      setDisplay(next || "0");
      return;
    }
    if (key === "=") {
      const result = evaluate(expr || display);
      setDisplay(result);
      setExpr(result === "Error" ? "" : result);
      return;
    }
    const next = expr === "0" && key !== "." ? key : expr + key;
    setExpr(next);
    setDisplay(next);
  };

  return (
    <div className="calc-app">
      <div className="calc-display" title={expr}>
        {display}
      </div>
      <div className="calc-keys">
        {KEYS.flat().map((key, i) =>
          key ? (
            <button
              key={`${key}-${i}`}
              type="button"
              className={key === "=" ? "accent" : ""}
              onClick={() => press(key)}
            >
              {key}
            </button>
          ) : (
            <span key={`spacer-${i}`} />
          ),
        )}
      </div>
    </div>
  );
}
