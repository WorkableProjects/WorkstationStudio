import { useState, useMemo } from "react";
import type { AppId } from "../types";
import { audioManager } from "../services/audioManager";

export interface FileNode {
  name: string;
  type: "file" | "directory";
  size?: string;
  modified?: string;
  content?: string;
  appTarget?: AppId;
}

const INITIAL_FS: Record<string, FileNode[]> = {
  "C:": [
    { name: "WINDOWS", type: "directory" },
    { name: "Documents", type: "directory" },
    { name: "Desktop", type: "directory" },
    { name: "Downloads", type: "directory" },
    { name: "Program Files", type: "directory" },
    { name: "AUTOEXEC.BAT", type: "file", size: "1 KB", modified: "2026-03-01", content: "@REM Workstation Studio Startup\nSET PATH=C:\\WINDOWS\\SYSTEM32" },
    { name: "CONFIG.SYS", type: "file", size: "1 KB", modified: "2026-03-01", content: "FILES=30\nBUFFERS=30" },
  ],
  "C:\\WINDOWS": [
    { name: "System32", type: "directory" },
    { name: "calc.exe", type: "file", size: "128 KB", modified: "2026-03-01", appTarget: "calculator" },
    { name: "notepad.exe", type: "file", size: "64 KB", modified: "2026-03-01", appTarget: "notes" },
    { name: "cmd.exe", type: "file", size: "256 KB", modified: "2026-03-01", appTarget: "terminal" },
    { name: "control.exe", type: "file", size: "180 KB", modified: "2026-03-01", appTarget: "settings" },
    { name: "winver.exe", type: "file", size: "32 KB", modified: "2026-03-01", appTarget: "about" },
  ],
  "C:\\Documents": [
    { name: "Project_Notes.md", type: "file", size: "4 KB", modified: "2026-03-02", content: "# Workstation Studio Notes\n\nFull retro OS shell build.", appTarget: "notes" },
    { name: "Budget_2026.calc", type: "file", size: "12 KB", modified: "2026-03-02", content: "100 + 250 + 400", appTarget: "calculator" },
  ],
  "C:\\Desktop": [
    { name: "Readme.txt", type: "file", size: "2 KB", modified: "2026-03-02", content: "Welcome to Workstation Studio Desktop!" },
  ],
  "C:\\Downloads": [
    { name: "Sample_Image.png", type: "file", size: "45 KB", modified: "2026-03-02", content: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" },
  ],
  "C:\\Program Files": [
    { name: "Workstation Studio", type: "directory" },
  ],
  "C:\\Program Files\\Workstation Studio": [
    { name: "Studio.exe", type: "file", size: "2.4 MB", modified: "2026-03-01", appTarget: "about" },
  ],
};

interface Props {
  onOpenFile?: (appId: AppId) => void;
}

export function FileManagerApp({ onOpenFile }: Props) {
  const [currentPath, setCurrentPath] = useState("C:\\");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [searchRegex, setSearchRegex] = useState("");
  const [fileFilter, setFileFilter] = useState("ALL");
  const [sortField, setSortField] = useState<"name" | "type" | "size">("name");
  const [sortAsc, setSortAsc] = useState(true);

  const [fs, setFs] = useState<Record<string, FileNode[]>>(() => {
    const saved = localStorage.getItem("workstation_file_manager_fs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return INITIAL_FS;
  });

  const [clipboard, setClipboard] = useState<{ mode: "copy" | "cut"; nodes: FileNode[]; sourcePath: string } | null>(null);
  const [undoStack, setUndoStack] = useState<Record<string, FileNode[]>[]>([]);
  const [showProperties, setShowProperties] = useState(false);
  const [editingFile, setEditingFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["C:\\", "C:\\Documents", "C:\\Desktop", "C:\\Downloads"]);

  const normalizedPath = currentPath.endsWith("\\") && currentPath.length > 3
    ? currentPath.slice(0, -1)
    : currentPath;

  const pushUndoState = () => {
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(fs))]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setFs(previous);
    localStorage.setItem("workstation_file_manager_fs", JSON.stringify(previous));
  };

  const persistFs = (nextFs: Record<string, FileNode[]>) => {
    pushUndoState();
    setFs(nextFs);
    localStorage.setItem("workstation_file_manager_fs", JSON.stringify(nextFs));
  };

  const rawFiles = fs[normalizedPath] || [];

  const processedFiles = useMemo(() => {
    let result = [...rawFiles];

    if (fileFilter !== "ALL") {
      result = result.filter((f) => {
        if (f.type === "directory") return true;
        const ext = f.name.split(".").pop()?.toUpperCase() || "";
        return ext === fileFilter;
      });
    }

    if (searchRegex.trim()) {
      try {
        const re = new RegExp(searchRegex, "i");
        result = result.filter((f) => re.test(f.name));
      } catch {
        // Ignore invalid regex
      }
    }

    result.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "type") cmp = a.type.localeCompare(b.type);
      else if (sortField === "size") cmp = (parseInt(a.size || "0", 10)) - (parseInt(b.size || "0", 10));
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [rawFiles, fileFilter, searchRegex, sortField, sortAsc]);

  const handleSelect = (e: React.MouseEvent, name: string) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedNames((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
      );
    } else {
      setSelectedNames([name]);
    }
  };

  const handleDoubleClick = (node: FileNode) => {
    if (node.type === "directory") {
      const nextPath = normalizedPath === "C:" ? `C:\\${node.name}` : `${normalizedPath}\\${node.name}`;
      if (!fs[nextPath]) {
        setFs((prev) => ({ ...prev, [nextPath]: [] }));
      }
      setCurrentPath(nextPath);
      setSelectedNames([]);
    } else if (node.type === "file") {
      if (node.appTarget && onOpenFile) {
        onOpenFile(node.appTarget);
      } else {
        setEditingFile(node);
        setFileContent(node.content || "");
      }
    }
  };

  const handleNavigateUp = () => {
    if (normalizedPath === "C:") return;
    const parts = normalizedPath.split("\\");
    parts.pop();
    const parentPath = parts.join("\\") || "C:";
    setCurrentPath(parentPath);
    setSelectedNames([]);
  };

  const handleCreateDirectory = () => {
    const dirName = prompt("Enter new folder name:");
    if (!dirName) return;
    const newDir: FileNode = { name: dirName, type: "directory" };
    const updatedList = [...(fs[normalizedPath] || []), newDir];
    const newFolderPath = normalizedPath === "C:" ? `C:\\${dirName}` : `${normalizedPath}\\${dirName}`;
    const nextFs = { ...fs, [normalizedPath]: updatedList, [newFolderPath]: [] };
    persistFs(nextFs);
  };

  const handleCreateFile = () => {
    const fileName = prompt("Enter new file name:");
    if (!fileName) return;
    const newFile: FileNode = {
      name: fileName,
      type: "file",
      size: "1 KB",
      modified: new Date().toISOString().slice(0, 10),
      content: "",
      appTarget: fileName.endsWith(".calc") ? "calculator" : "notes",
    };
    const updatedList = [...(fs[normalizedPath] || []), newFile];
    persistFs({ ...fs, [normalizedPath]: updatedList });
  };

  const handleDelete = () => {
    if (selectedNames.length === 0) {
      audioManager.playErrorSound();
      return;
    }
    const updatedList = (fs[normalizedPath] || []).filter((f) => !selectedNames.includes(f.name));
    persistFs({ ...fs, [normalizedPath]: updatedList });
    setSelectedNames([]);
  };

  const handleCopy = () => {
    const selectedNodes = rawFiles.filter((f) => selectedNames.includes(f.name));
    if (selectedNodes.length === 0) return;
    setClipboard({ mode: "copy", nodes: selectedNodes, sourcePath: normalizedPath });
  };

  const handleCut = () => {
    const selectedNodes = rawFiles.filter((f) => selectedNames.includes(f.name));
    if (selectedNodes.length === 0) return;
    setClipboard({ mode: "cut", nodes: selectedNodes, sourcePath: normalizedPath });
  };

  const handlePaste = () => {
    if (!clipboard) return;
    let targetList = [...(fs[normalizedPath] || [])];
    clipboard.nodes.forEach((node) => {
      if (!targetList.some((f) => f.name === node.name)) {
        targetList.push({ ...node });
      }
    });

    let nextFs = { ...fs, [normalizedPath]: targetList };

    if (clipboard.mode === "cut" && clipboard.sourcePath !== normalizedPath) {
      const cutNames = clipboard.nodes.map((n) => n.name);
      const sourceList = (fs[clipboard.sourcePath] || []).filter((f) => !cutNames.includes(f.name));
      nextFs[clipboard.sourcePath] = sourceList;
      setClipboard(null);
    }

    persistFs(nextFs);
  };

  const handleRename = () => {
    if (selectedNames.length !== 1) return;
    const oldName = selectedNames[0];
    const newName = prompt("Rename to:", oldName);
    if (!newName || newName === oldName) return;

    const updatedList = (fs[normalizedPath] || []).map((f) =>
      f.name === oldName ? { ...f, name: newName } : f
    );
    persistFs({ ...fs, [normalizedPath]: updatedList });
    setSelectedNames([newName]);
  };

  const handleAddBookmark = () => {
    if (!favorites.includes(normalizedPath)) {
      setFavorites([...favorites, normalizedPath]);
    }
  };

  const selectedFileNode = rawFiles.find((f) => f.name === selectedNames[0]);
  const breadcrumbs = normalizedPath.split("\\").filter(Boolean);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "4px",
        gap: "4px",
        backgroundColor: "var(--dialog-bg)",
        fontFamily: "Tahoma, sans-serif",
        fontSize: "11px",
      }}
    >
      {/* Top Action & Breadcrumb Bar */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" onClick={handleNavigateUp} disabled={normalizedPath === "C:"}>
          ⬆️ Up
        </button>

        {/* Breadcrumbs */}
        <div
          className="inset-border"
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            padding: "2px 6px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            overflowX: "auto",
          }}
        >
          <span
            style={{ cursor: "pointer", fontWeight: "bold", color: "#000080" }}
            onClick={() => {
              setCurrentPath("C:\\");
              setSelectedNames([]);
            }}
          >
            C:
          </span>
          {breadcrumbs.slice(1).map((part, idx) => {
            const subPath = "C:\\" + breadcrumbs.slice(1, idx + 2).join("\\");
            return (
              <span key={subPath} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span>\</span>
                <span
                  style={{ cursor: "pointer", fontWeight: "bold", color: "#000080" }}
                  onClick={() => {
                    setCurrentPath(subPath);
                    setSelectedNames([]);
                  }}
                >
                  {part}
                </span>
              </span>
            );
          })}
        </div>

        {/* Toolbar Buttons */}
        <button type="button" onClick={handleCreateDirectory}>📁 Folder</button>
        <button type="button" onClick={handleCreateFile}>📄 File</button>
        <button type="button" onClick={handleAddBookmark}>⭐ Bookmark</button>
        <button type="button" onClick={handleCopy} disabled={selectedNames.length === 0}>Copy</button>
        <button type="button" onClick={handleCut} disabled={selectedNames.length === 0}>Cut</button>
        <button type="button" onClick={handlePaste} disabled={!clipboard}>Paste</button>
        <button type="button" onClick={handleRename} disabled={selectedNames.length !== 1}>Rename</button>
        <button type="button" onClick={handleDelete} disabled={selectedNames.length === 0}>Delete</button>
        <button type="button" onClick={handleUndo} disabled={undoStack.length === 0}>Undo</button>
        <button type="button" onClick={() => setShowProperties(!showProperties)} disabled={!selectedFileNode}>
          Props
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <span style={{ fontSize: "10px" }}>Filter:</span>
        <select value={fileFilter} onChange={(e) => setFileFilter(e.target.value)} style={{ fontSize: "11px" }}>
          <option value="ALL">All Files (*.*)</option>
          <option value="TXT">Text (*.txt)</option>
          <option value="MD">Markdown (*.md)</option>
          <option value="CALC">Calculator (*.calc)</option>
        </select>

        <span style={{ fontSize: "10px", marginLeft: "6px" }}>Regex Search:</span>
        <input
          type="text"
          placeholder="e.g. ^Proj.*"
          value={searchRegex}
          onChange={(e) => setSearchRegex(e.target.value)}
          style={{ flex: 1, fontSize: "11px" }}
        />
      </div>

      {/* Main Two-Pane View */}
      {!editingFile ? (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "140px 1fr 180px", gap: "4px", minHeight: 0 }}>
          {/* Left Quick Access / Folder Tree Sidebar */}
          <div
            className="inset-border"
            style={{
              backgroundColor: "#ffffff",
              overflowY: "auto",
              padding: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <div style={{ fontWeight: "bold", color: "#606060", marginBottom: "4px", fontSize: "10px" }}>
              QUICK ACCESS
            </div>
            {favorites.map((fav) => (
              <button
                key={fav}
                type="button"
                onClick={() => {
                  setCurrentPath(fav);
                  setSelectedNames([]);
                }}
                style={{
                  textAlign: "left",
                  fontSize: "11px",
                  padding: "2px 4px",
                  background: currentPath === fav ? "var(--title-bg-active)" : "transparent",
                  color: currentPath === fav ? "var(--title-fg-active)" : "#000000",
                  border: "none",
                  boxShadow: "none",
                  cursor: "pointer",
                }}
              >
                📁 {fav.split("\\").pop() || "C:"}
              </button>
            ))}
          </div>

          {/* Center File Listing */}
          <div className="inset-border" style={{ backgroundColor: "#ffffff", overflowY: "auto", padding: "2px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #c0c0c0", cursor: "pointer" }}>
                  <th onClick={() => { setSortField("name"); setSortAsc(!sortAsc); }} style={{ padding: "2px 4px" }}>
                    Name {sortField === "name" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => { setSortField("type"); setSortAsc(!sortAsc); }} style={{ padding: "2px 4px" }}>
                    Type {sortField === "type" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => { setSortField("size"); setSortAsc(!sortAsc); }} style={{ padding: "2px 4px" }}>
                    Size {sortField === "size" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedFiles.map((node) => {
                  const isSelected = selectedNames.includes(node.name);
                  return (
                    <tr
                      key={node.name}
                      onClick={(e) => handleSelect(e, node.name)}
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
                      <td style={{ padding: "2px 4px" }}>{node.type === "directory" ? "Folder" : "File"}</td>
                      <td style={{ padding: "2px 4px" }}>{node.size || "-"}</td>
                    </tr>
                  );
                })}
                {processedFiles.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ color: "#808080", padding: "8px", textAlign: "center" }}>
                      This folder is empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Right File Preview Pane & Properties */}
          <div
            className="inset-border"
            style={{
              backgroundColor: "#ffffff",
              padding: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              overflowY: "auto",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "10px", color: "#606060", borderBottom: "1px solid #e0e0e0", paddingBottom: "2px" }}>
              {showProperties ? "PROPERTIES PANEL" : "PREVIEW & DETAILS"}
            </div>

            {selectedFileNode ? (
              <>
                <div>
                  <strong>{selectedFileNode.name}</strong>
                  <div style={{ color: "#606060", fontSize: "10px" }}>
                    Type: {selectedFileNode.type.toUpperCase()}<br />
                    Size: {selectedFileNode.size || "Unknown"}<br />
                    Modified: {selectedFileNode.modified || "N/A"}<br />
                    {showProperties && "Permissions: Read / Write"}
                  </div>
                </div>

                <div
                  className="inset-border"
                  style={{
                    flex: 1,
                    backgroundColor: "#f8f8f8",
                    padding: "4px",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedFileNode.content ? selectedFileNode.content.slice(0, 300) : "(No preview available)"}
                </div>
              </>
            ) : (
              <div style={{ color: "#808080", textAlign: "center", marginTop: "20px" }}>
                Select a file to preview
              </div>
            )}
          </div>
        </div>
      ) : (
        /* In-place editor mode */
        <div
          className="inset-border"
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            padding: "6px",
            gap: "6px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Editing: {editingFile.name}</strong>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                type="button"
                onClick={() => {
                  const updatedList = (fs[normalizedPath] || []).map((f) =>
                    f.name === editingFile.name ? { ...f, content: fileContent } : f
                  );
                  persistFs({ ...fs, [normalizedPath]: updatedList });
                  setEditingFile(null);
                }}
              >
                Save
              </button>
              <button type="button" onClick={() => setEditingFile(null)}>
                Cancel
              </button>
            </div>
          </div>
          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            style={{ flex: 1, resize: "none", width: "100%", height: "100%", fontFamily: "monospace" }}
          />
        </div>
      )}
    </div>
  );
}
