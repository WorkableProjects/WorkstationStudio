import { useState } from "react";
import type { AppId } from "../types";
import { audioManager } from "../services/audioManager";

interface FileNode {
  name: string;
  type: "file" | "directory";
  size?: string;
  appTarget?: AppId;
}

const VIRTUAL_FS: Record<string, FileNode[]> = {
  "C:": [
    { name: "WINDOWS", type: "directory" },
    { name: "My Documents", type: "directory" },
    { name: "Program Files", type: "directory" },
    { name: "AUTOEXEC.BAT", type: "file", size: "1 KB" },
    { name: "CONFIG.SYS", type: "file", size: "1 KB" },
  ],
  "C:\\WINDOWS": [
    { name: "System32", type: "directory" },
    { name: "calc.exe", type: "file", size: "128 KB", appTarget: "calculator" },
    { name: "notepad.exe", type: "file", size: "64 KB", appTarget: "notes" },
    { name: "cmd.exe", type: "file", size: "256 KB", appTarget: "terminal" },
    { name: "control.exe", type: "file", size: "180 KB", appTarget: "settings" },
    { name: "winver.exe", type: "file", size: "32 KB", appTarget: "about" },
  ],
  "C:\\My Documents": [
    { name: "Project_Notes.txt", type: "file", size: "4 KB", appTarget: "notes" },
    { name: "Budget_2026.calc", type: "file", size: "12 KB", appTarget: "calculator" },
  ],
  "C:\\Program Files": [
    { name: "Workstation Studio", type: "directory" },
  ],
  "C:\\Program Files\\Workstation Studio": [
    { name: "Studio.exe", type: "file", size: "2.4 MB", appTarget: "about" },
  ],
};

interface Props {
  onOpenFile?: (appId: AppId) => void;
}

export function FileManagerApp({ onOpenFile }: Props) {
  const [currentPath, setCurrentPath] = useState("C:\\");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [customFiles, setCustomFiles] = useState<Record<string, FileNode[]>>(VIRTUAL_FS);

  const normalizedPath = currentPath.endsWith("\\") && currentPath.length > 3
    ? currentPath.slice(0, -1)
    : currentPath;

  const files = customFiles[normalizedPath] || [];

  const handleDoubleClick = (node: FileNode) => {
    if (node.type === "directory") {
      const nextPath = normalizedPath === "C:" ? `C:\\${node.name}` : `${normalizedPath}\\${node.name}`;
      setCurrentPath(nextPath);
      setSelectedFile(null);
    } else if (node.type === "file" && node.appTarget) {
      if (onOpenFile) {
        onOpenFile(node.appTarget);
      }
    } else {
      audioManager.playErrorSound();
    }
  };

  const handleNavigateUp = () => {
    if (normalizedPath === "C:") return;
    const parts = normalizedPath.split("\\");
    parts.pop();
    const parentPath = parts.join("\\") || "C:";
    setCurrentPath(parentPath);
    setSelectedFile(null);
  };

  const handleCreateFile = () => {
    const fileName = prompt("Enter new file name:");
    if (!fileName) return;
    const newFile: FileNode = {
      name: fileName,
      type: "file",
      size: "0 KB",
      appTarget: "notes",
    };
    setCustomFiles((prev) => ({
      ...prev,
      [normalizedPath]: [...(prev[normalizedPath] || []), newFile],
    }));
  };

  const handleDeleteFile = () => {
    if (!selectedFile) {
      audioManager.playErrorSound();
      return;
    }
    setCustomFiles((prev) => ({
      ...prev,
      [normalizedPath]: (prev[normalizedPath] || []).filter((f) => f.name !== selectedFile),
    }));
    setSelectedFile(null);
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
      {/* Address Bar and Action Controls */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <button type="button" onClick={handleNavigateUp} disabled={normalizedPath === "C:"}>
          ⬆️ Up
        </button>
        <button type="button" onClick={handleCreateFile}>
          📄 New File
        </button>
        <button type="button" onClick={handleDeleteFile} disabled={!selectedFile}>
          🗑️ Delete
        </button>
        <span style={{ fontSize: "11px", marginLeft: "4px" }}>Path:</span>
        <input
          type="text"
          value={currentPath}
          readOnly
          style={{ flex: 1, backgroundColor: "#ffffff" }}
        />
      </div>

      {/* Directory Contents List */}
      <div
        className="inset-border"
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          overflowY: "auto",
          padding: "4px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #c0c0c0" }}>
              <th style={{ padding: "2px 4px" }}>Name</th>
              <th style={{ padding: "2px 4px" }}>Type</th>
              <th style={{ padding: "2px 4px" }}>Size</th>
            </tr>
          </thead>
          <tbody>
            {files.map((node) => {
              const isSelected = selectedFile === node.name;
              return (
                <tr
                  key={node.name}
                  onClick={() => setSelectedFile(node.name)}
                  onDoubleClick={() => handleDoubleClick(node)}
                  style={{
                    backgroundColor: isSelected ? "var(--title-bg-active)" : "transparent",
                    color: isSelected ? "var(--title-fg-active)" : "#000000",
                    cursor: "pointer",
                  }}
                >
                  <td style={{ padding: "2px 4px" }}>
                    <span style={{ marginRight: "6px" }}>
                      {node.type === "directory" ? "📁" : "📄"}
                    </span>
                    {node.name}
                  </td>
                  <td style={{ padding: "2px 4px" }}>
                    {node.type === "directory" ? "Folder" : "File"}
                  </td>
                  <td style={{ padding: "2px 4px" }}>{node.size || "-"}</td>
                </tr>
              );
            })}
            {files.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: "#808080", padding: "8px", textAlign: "center" }}>
                  This folder is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
