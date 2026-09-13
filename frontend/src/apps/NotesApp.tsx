import { useMemo, useState } from "react";
import { createNote, loadNotes, saveNotes, type Note } from "../notes/storage";
import { audioManager } from "../services/audioManager";

export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [selectedId, setSelectedId] = useState<string | null>(
    () => loadNotes()[0]?.id ?? null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes;
    const term = searchTerm.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(term) ||
        n.body.toLowerCase().includes(term),
    );
  }, [notes, searchTerm]);

  const selected = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  const persist = (next: Note[]) => {
    setNotes(next);
    saveNotes(next);
  };

  const add = () => {
    const note = createNote();
    persist([note, ...notes]);
    setSelectedId(note.id);
  };

  const update = (patch: Partial<Note>) => {
    if (!selected) return;
    const next = notes.map((n) =>
      n.id === selected.id ? { ...n, ...patch, updatedAt: Date.now() } : n,
    );
    persist(next);
  };

  const remove = () => {
    if (!selected) {
      audioManager.playErrorSound();
      return;
    }
    const next = notes.filter((n) => n.id !== selected.id);
    persist(next);
    setSelectedId(next[0]?.id ?? null);
  };

  const exportTxt = () => {
    if (!selected) {
      audioManager.playErrorSound();
      return;
    }
    const blob = new Blob([selected.body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.title || "Untitled"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportRtf = () => {
    if (!selected) {
      audioManager.playErrorSound();
      return;
    }
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Tahoma;}}\\f0\\fs20 ${selected.title}\\line\\line ${selected.body.replace(/\n/g, "\\line ")}}`;
    const blob = new Blob([rtfContent], { type: "application/rtf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.title || "Untitled"}.rtf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        height: "100%",
        backgroundColor: "var(--dialog-bg)",
        fontFamily: "Tahoma, sans-serif",
      }}
    >
      <aside
        style={{
          borderRight: "2px solid var(--border-dark)",
          display: "flex",
          flexDirection: "column",
          padding: "4px",
          gap: "4px",
        }}
      >
        <div style={{ display: "flex", gap: "2px" }}>
          <button
            type="button"
            onClick={add}
            style={{ flex: 1, fontSize: "11px" }}
          >
            New
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={!selected}
            style={{ flex: 1, fontSize: "11px" }}
          >
            Delete
          </button>
        </div>

        <input
          type="search"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", fontSize: "11px" }}
        />

        <div
          className="inset-border"
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            overflowY: "auto",
            padding: "2px",
          }}
        >
          {filteredNotes.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedId(n.id)}
              style={{
                padding: "3px 5px",
                cursor: "pointer",
                backgroundColor:
                  n.id === selectedId ? "var(--title-bg-active)" : "transparent",
                color: n.id === selectedId ? "var(--title-fg-active)" : "#000",
                fontSize: "11px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {n.title || "Untitled"}
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div style={{ color: "#808080", padding: "4px", fontSize: "11px" }}>
              No notes
            </div>
          )}
        </div>
      </aside>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "4px",
          gap: "4px",
        }}
      >
        {selected ? (
          <>
            <div
              style={{
                display: "flex",
                gap: "4px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className={isBold ? "pressed" : ""}
                onClick={() => setIsBold(!isBold)}
                style={{ fontWeight: "bold", width: "26px" }}
              >
                B
              </button>
              <button
                type="button"
                className={isItalic ? "pressed" : ""}
                onClick={() => setIsItalic(!isItalic)}
                style={{ fontStyle: "italic", width: "26px" }}
              >
                I
              </button>
              <button
                type="button"
                className={isUnderline ? "pressed" : ""}
                onClick={() => setIsUnderline(!isUnderline)}
                style={{ textDecoration: "underline", width: "26px" }}
              >
                U
              </button>

              <div
                style={{
                  width: "1px",
                  height: "18px",
                  backgroundColor: "var(--border-dark)",
                  margin: "0 2px",
                }}
              />

              <button
                type="button"
                onClick={exportTxt}
                style={{ fontSize: "11px" }}
              >
                Export .txt
              </button>
              <button
                type="button"
                onClick={exportRtf}
                style={{ fontSize: "11px" }}
              >
                Export .rtf
              </button>
            </div>

            <input
              type="text"
              value={selected.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Title"
              style={{ fontWeight: "bold" }}
            />

            <textarea
              value={selected.body}
              onChange={(e) => update({ body: e.target.value })}
              placeholder="Write note here..."
              style={{
                flex: 1,
                resize: "none",
                fontWeight: isBold ? "bold" : "normal",
                fontStyle: isItalic ? "italic" : "normal",
                textDecoration: isUnderline ? "underline" : "none",
              }}
            />
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#808080",
            }}
          >
            Select or create a note to edit
          </div>
        )}
      </section>
    </div>
  );
}
