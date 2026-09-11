import { useMemo, useState } from "react";
import { createNote, loadNotes, saveNotes, type Note } from "../notes/storage";

export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [selectedId, setSelectedId] = useState<string | null>(
    () => loadNotes()[0]?.id ?? null,
  );

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
      n.id === selected.id
        ? { ...n, ...patch, updatedAt: Date.now() }
        : n,
    );
    persist(next);
  };

  const remove = () => {
    if (!selected) return;
    const next = notes.filter((n) => n.id !== selected.id);
    persist(next);
    setSelectedId(next[0]?.id ?? null);
  };

  return (
    <div className="notes-app">
      <aside className="notes-sidebar">
        <div className="notes-toolbar">
          <button type="button" onClick={add}>
            New
          </button>
          <button type="button" onClick={remove} disabled={!selected}>
            Delete
          </button>
        </div>
        <ul className="notes-list">
          {notes.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={n.id === selectedId ? "active" : ""}
                onClick={() => setSelectedId(n.id)}
              >
                {n.title || "Untitled"}
              </button>
            </li>
          ))}
          {notes.length === 0 && <li className="muted">No notes yet</li>}
        </ul>
      </aside>
      <section className="notes-editor">
        {selected ? (
          <>
            <input
              className="notes-title"
              value={selected.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Title"
            />
            <textarea
              className="notes-body"
              value={selected.body}
              onChange={(e) => update({ body: e.target.value })}
              placeholder="Write something…"
            />
          </>
        ) : (
          <p className="muted">Create a note to get started.</p>
        )}
      </section>
    </div>
  );
}
