import { useState } from "react";
import { audioManager } from "../services/audioManager";

export function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState<number | null>(null);
  const [newInput, setNewInput] = useState(true);

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

  const handleOp = (op: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;

      if (op === "sqrt") {
        if (val < 0) {
          audioManager.playErrorSound();
          setDisplay("Invalid input");
          setNewInput(true);
          return;
        }
        setDisplay(String(Math.sqrt(val)));
        setNewInput(true);
      } else if (op === "%") {
        setDisplay(String(val / 100));
        setNewInput(true);
      } else if (op === "+/-") {
        setDisplay(String(-val));
      }
    } catch {
      audioManager.playErrorSound();
      setDisplay("Error");
      setNewInput(true);
    }
  };

  const handleMemory = (op: string) => {
    const val = parseFloat(display);
    if (op === "MC") {
      setMemory(null);
    } else if (op === "MR") {
      if (memory !== null) {
        setDisplay(String(memory));
        setNewInput(true);
      }
    } else if (op === "MS") {
      if (!isNaN(val)) {
        setMemory(val);
        setNewInput(true);
      }
    } else if (op === "M+") {
      if (!isNaN(val)) {
        setMemory((memory || 0) + val);
        setNewInput(true);
      }
    }
  };

  const handleEval = () => {
    try {
      // Clean display expression before eval
      const cleanExpr = display.replace(/×/g, "*").replace(/÷/g, "/");
      if (!/^[\d+\-*/().\s]+$/.test(cleanExpr)) {
        throw new Error("Invalid expression");
      }
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${cleanExpr})`)();
      if (typeof result !== "number" || !Number.isFinite(result)) {
        throw new Error("Invalid result");
      }
      setDisplay(String(result));
      setNewInput(true);
    } catch {
      audioManager.playErrorSound();
      setDisplay("Error");
      setNewInput(true);
    }
  };

  const appendOperator = (op: string) => {
    setDisplay(display + " " + op + " ");
    setNewInput(false);
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
        fontFamily: "Tahoma, sans-serif",
      }}
    >
      {/* Indicator area for Memory */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 2px",
          fontSize: "10px",
        }}
      >
        <div
          className="inset-border"
          style={{
            width: "24px",
            height: "18px",
            textAlign: "center",
            lineHeight: "16px",
            fontWeight: "bold",
            background: "#fff",
          }}
        >
          {memory !== null ? "M" : ""}
        </div>
        <div style={{ color: "#808080" }}>Standard</div>
      </div>

      {/* Main Display Box */}
      <div
        className="inset-border"
        style={{
          background: "#ffffff",
          padding: "4px 8px",
          textAlign: "right",
          fontSize: "16px",
          fontWeight: "bold",
          fontFamily: "Courier New, monospace",
          height: "32px",
          lineHeight: "22px",
          overflow: "hidden",
        }}
      >
        {display}
      </div>

      {/* Keypad */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "4px",
          flex: 1,
        }}
      >
        <button type="button" onClick={() => handleMemory("MC")}>
          MC
        </button>
        <button type="button" onClick={handleBackspace}>
          Backspace
        </button>
        <button type="button" onClick={() => setDisplay("0")}>
          CE
        </button>
        <button type="button" onClick={handleClear}>
          C
        </button>
        <button type="button" onClick={() => handleOp("+/-")}>
          +/-
        </button>

        <button type="button" onClick={() => handleMemory("MR")}>
          MR
        </button>
        <button type="button" onClick={() => handleDigit("7")}>
          7
        </button>
        <button type="button" onClick={() => handleDigit("8")}>
          8
        </button>
        <button type="button" onClick={() => handleDigit("9")}>
          9
        </button>
        <button type="button" onClick={() => appendOperator("÷")}>
          /
        </button>

        <button type="button" onClick={() => handleMemory("MS")}>
          MS
        </button>
        <button type="button" onClick={() => handleDigit("4")}>
          4
        </button>
        <button type="button" onClick={() => handleDigit("5")}>
          5
        </button>
        <button type="button" onClick={() => handleDigit("6")}>
          6
        </button>
        <button type="button" onClick={() => appendOperator("×")}>
          *
        </button>

        <button type="button" onClick={() => handleMemory("M+")}>
          M+
        </button>
        <button type="button" onClick={() => handleDigit("1")}>
          1
        </button>
        <button type="button" onClick={() => handleDigit("2")}>
          2
        </button>
        <button type="button" onClick={() => handleDigit("3")}>
          3
        </button>
        <button type="button" onClick={() => appendOperator("-")}>
          -
        </button>

        <button type="button" onClick={() => handleOp("sqrt")}>
          sqrt
        </button>
        <button type="button" onClick={() => handleDigit("0")}>
          0
        </button>
        <button type="button" onClick={handleDecimal}>
          .
        </button>
        <button type="button" onClick={() => handleOp("%")}>
          %
        </button>
        <button type="button" onClick={() => appendOperator("+")}>
          +
        </button>

        <button
          type="button"
          onClick={handleEval}
          style={{ gridColumn: "span 5", fontWeight: "bold" }}
        >
          =
        </button>
      </div>
    </div>
  );
}
