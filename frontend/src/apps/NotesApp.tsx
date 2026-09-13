import { useState, useMemo, useEffect, useRef } from "react";

export interface MarkdownNote {
  id: string;
  title: string;
  body: string;
  tags: string[];
  pinned?: boolean;
  updatedAt: number;
}

const INITIAL_NOTES: MarkdownNote[] = [
  {
    id: "welcome-note",
    title: "Welcome to Workstation Studio Notes",
    body: "# Welcome to Notes\n\nThis is a **Markdown-enabled** note editor.\n\n- [x] Create notes\n- [x] Live split-pane preview\n- [x] Tag and pin notes\n- [x] Export to `.md`, `.html`, `.pdf`, `.txt`\n\n```javascript\nconsole.log('Workstation Studio 0.0.3.677.8');\n```",
    tags: ["Welcome", "Docs"],
    pinned: true,
    updatedAt: Date.now(),
  },
];

export function NotesApp() {
  const [notes, setNotes] = useState<MarkdownNote[]>(() => {
    try {
      const saved = localStorage.getItem("workstation_markdown_notes");
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [splitView, setSplitView] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [history, setHistory] = useState<MarkdownNote[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const selected = useMemo(
    () => notes.find((n) => n.id === selectedId) || null,
    [notes, selectedId]
  );

  // Auto-save every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.getItem("workstation_markdown_notes");
      localStorage.setItem("workstation_markdown_notes", JSON.stringify(notes));
    }, 30000);
    return () => clearInterval(timer);
  }, [notes]);

  const saveAndPushState = (nextNotes: MarkdownNote[]) => {
    setNotes(nextNotes);
    localStorage.setItem("workstation_markdown_notes", JSON.stringify(nextNotes));
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), nextNotes]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setNotes(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setNotes(history[historyIndex + 1]);
    }
  };

  const createNewNote = () => {
    const newNote: MarkdownNote = {
      id: crypto.randomUUID(),
      title: "New Note",
      body: "# New Note\n\nStart writing here...",
      tags: ["General"],
      pinned: false,
      updatedAt: Date.now(),
    };
    saveAndPushState([newNote, ...notes]);
    setSelectedId(newNote.id);
  };

  const updateSelectedNote = (patch: Partial<MarkdownNote>) => {
    if (!selected) return;
    const updated = notes.map((n) =>
      n.id === selected.id ? { ...n, ...patch, updatedAt: Date.now() } : n
    );
    saveAndPushState(updated);
  };

  const deleteSelectedNote = () => {
    if (!selected) return;
    if (!confirm(`Delete note "${selected.title}"?`)) return;
    const remaining = notes.filter((n) => n.id !== selected.id);
    saveAndPushState(remaining);
    setSelectedId(remaining[0]?.id || null);
  };

  const togglePin = () => {
    if (!selected) return;
    updateSelectedNote({ pinned: !selected.pinned });
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current || !selected) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = selected.body;
    const selectedText = text.substring(start, end) || "text";
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newBody = text.substring(0, start) + replacement + text.substring(end);
    updateSelectedNote({ body: newBody });
  };

  const exportAsFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMd = () => selected && exportAsFile(selected.body, `${selected.title}.md`, "text/markdown");
  const exportTxt = () => selected && exportAsFile(selected.body, `${selected.title}.txt`, "text/plain");
  const exportHtml = () => {
    if (!selected) return;
    const html = `<!DOCTYPE html><html><head><title>${selected.title}</title></head><body>${renderMarkdown(selected.body)}</body></html>`;
    exportAsFile(html, `${selected.title}.html`, "text/html");
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const renderMarkdown = (src: string) => {
    let safe = escapeHtml(src);
    let html = safe
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/~~(.*?)~~/gim, "<del>$1</del>")
      .replace(/`(.*?)`/gim, "<code style='background:#eee;padding:2px 4px;'>$1</code>")
      .replace(/```([\s\S]*?)```/gim, "<pre style='background:#f4f4f4;padding:8px;'><code>$1</code></pre>")
      .replace(/^\- \[(x| )\] (.*$)/gim, (_, checked, text) => `<p><input type="checkbox" ${checked === "x" ? "checked" : ""} disabled /> ${text}</p>`)
      .replace(/^\- (.*$)/gim, "<li>$1</li>")
      .replace(/\n$/gim, "<br />");
    return html;
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        if (selectedTag && !n.tags.includes(selectedTag)) return false;
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return n.title.toLowerCase().includes(term) || n.body.toLowerCase().includes(term);
      })
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [notes, searchTerm, selectedTag]);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        backgroundColor: "var(--dialog-bg)",
        fontFamily: "Tahoma, sans-serif",
        fontSize: "11px",
      }}
    >
      {!focusMode && (
        <aside
          style={{
            width: "200px",
            borderRight: "2px solid var(--border-dark)",
            display: "flex",
            flexDirection: "column",
            padding: "4px",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", gap: "2px" }}>
            <button type="button" onClick={createNewNote} style={{ flex: 1 }}>
              + New Note
            </button>
            <button type="button" onClick={deleteSelectedNote} disabled={!selected}>
              🗑️ Delete
            </button>
          </div>

          <input
            type="search"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%" }}
          />

          <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", margin: "2px 0" }}>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              style={{ fontSize: "9px", padding: "1px 4px", fontWeight: !selectedTag ? "bold" : "normal" }}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                style={{ fontSize: "9px", padding: "1px 4px", fontWeight: selectedTag === tag ? "bold" : "normal" }}
              >
                #{tag}
              </button>
            ))}
          </div>

          <div className="inset-border" style={{ flex: 1, backgroundColor: "#ffffff", overflowY: "auto", padding: "2px" }}>
            {filteredNotes.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedId(n.id)}
                style={{
                  padding: "4px 6px",
                  cursor: "pointer",
                  backgroundColor: n.id === selectedId ? "var(--title-bg-active)" : "transparent",
                  color: n.id === selectedId ? "var(--title-fg-active)" : "#000000",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  {n.pinned && "📌 "}{n.title || "Untitled"}
                </div>
              </div>
            ))}
            {filteredNotes.length === 0 && (
              <div style={{ color: "#808080", padding: "8px", textAlign: "center" }}>No notes found</div>
            )}
          </div>
        </aside>
      )}

      <section style={{ flex: 1, display: "flex", flexDirection: "column", padding: "4px", gap: "4px" }}>
        {selected ? (
          <>
            <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => insertMarkdown("**", "**")} title="Bold"><strong>B</strong></button>
              <button type="button" onClick={() => insertMarkdown("*", "*")} title="Italic"><em>I</em></button>
              <button type="button" onClick={() => insertMarkdown("~~", "~~")} title="Strikethrough"><del>S</del></button>
              <button type="button" onClick={() => insertMarkdown("# ")} title="Header 1">H1</button>
              <button type="button" onClick={() => insertMarkdown("## ")} title="Header 2">H2</button>
              <button type="button" onClick={() => insertMarkdown("- ")} title="List">• List</button>
              <button type="button" onClick={() => insertMarkdown("```\n", "\n```")} title="Code block">Code</button>

              <div style={{ width: "1px", height: "16px", backgroundColor: "var(--border-dark)", margin: "0 2px" }} />

              <button type="button" onClick={handleUndo} disabled={historyIndex <= 0}>Undo</button>
              <button type="button" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>Redo</button>
              <button type="button" onClick={togglePin}>
                {selected.pinned ? "📌 Pinned" : "📍 Pin"}
              </button>
              <button type="button" onClick={() => setSplitView(!splitView)}>
                {splitView ? "Editor Only" : "Split Preview"}
              </button>
              <button type="button" onClick={() => setFocusMode(!focusMode)}>
                {focusMode ? "Exit Focus" : "Focus Mode"}
              </button>

              <div style={{ width: "1px", height: "16px", backgroundColor: "var(--border-dark)", margin: "0 2px" }} />

              <button type="button" onClick={exportMd}>Export .md</button>
              <button type="button" onClick={exportHtml}>Export .html</button>
              <button type="button" onClick={exportTxt}>Export .txt</button>
            </div>

            <input
              type="text"
              value={selected.title}
              onChange={(e) => updateSelectedNote({ title: e.target.value })}
              placeholder="Note Title..."
              style={{ fontWeight: "bold", fontSize: "12px" }}
            />

            <div style={{ flex: 1, display: "grid", gridTemplateColumns: splitView ? "1fr 1fr" : "1fr", gap: "4px", minHeight: 0 }}>
              <textarea
                ref={textareaRef}
                value={selected.body}
                onChange={(e) => updateSelectedNote({ body: e.target.value })}
                placeholder="Write Markdown note..."
                style={{ flex: 1, resize: "none", width: "100%", height: "100%", fontFamily: "monospace" }}
              />

              {splitView && (
                <div
                  className="inset-border"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    padding: "8px",
                    overflowY: "auto",
                    fontSize: "11px",
                    lineHeight: "1.4",
                  }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.body) }}
                />
              )}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#808080" }}>
            Select or create a note to begin editing
          </div>
        )}
      </section>
    </div>
  );
}
