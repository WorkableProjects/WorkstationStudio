import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
}

export function CodeEditorApp() {
  const { getUserStorageItem, setUserStorageItem, currentUser } = useUser();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = getUserStorageItem("code_snippets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSnippets(parsed);
        setSelectedId(parsed[0]?.id || null);
      } catch {
        setSnippets([]);
      }
    } else {
      const initial = [
        {
          id: "1",
          title: "script.js",
          code: "// Workstation Studio 0.0.2.6.6\nconsole.log('Hello Workstation OS');",
          language: "javascript",
        },
      ];
      setSnippets(initial);
      setSelectedId("1");
    }
  }, [currentUser]);

  const saveSnippets = (list: Snippet[]) => {
    setSnippets(list);
    setUserStorageItem("code_snippets", JSON.stringify(list));
  };

  const selected = snippets.find((s) => s.id === selectedId) || null;

  const addSnippet = () => {
    const newSnippet: Snippet = {
      id: crypto.randomUUID(),
      title: "untitled.ts",
      code: "// New Code Snippet\n",
      language: "typescript",
    };
    saveSnippets([newSnippet, ...snippets]);
    setSelectedId(newSnippet.id);
  };

  const updateSelected = (patch: Partial<Snippet>) => {
    if (!selected) return;
    const updated = snippets.map((s) =>
      s.id === selected.id ? { ...s, ...patch } : s
    );
    saveSnippets(updated);
  };

  const deleteSnippet = () => {
    if (!selected) return;
    const filtered = snippets.filter((s) => s.id !== selected.id);
    saveSnippets(filtered);
    setSelectedId(filtered[0]?.id || null);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        height: "100%",
        backgroundColor: "var(--dialog-bg)",
        fontFamily: "inherit",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid var(--border-dark)",
          display: "flex",
          flexDirection: "column",
          padding: "4px",
          gap: "4px",
        }}
      >
        <div style={{ display: "flex", gap: "2px" }}>
          <button type="button" onClick={addSnippet} style={{ flex: 1, fontSize: "11px" }}>
            New
          </button>
          <button
            type="button"
            onClick={deleteSnippet}
            disabled={!selected}
            style={{ flex: 1, fontSize: "11px" }}
          >
            Delete
          </button>
        </div>

        <div
          className="inset-border"
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            overflowY: "auto",
            padding: "2px",
          }}
        >
          {snippets.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              style={{
                padding: "3px 5px",
                cursor: "pointer",
                backgroundColor:
                  s.id === selectedId ? "var(--title-bg-active)" : "transparent",
                color: s.id === selectedId ? "var(--title-fg-active)" : "#000",
                fontSize: "11px",
              }}
            >
              📄 {s.title}
            </div>
          ))}
        </div>
      </aside>

      <section style={{ display: "flex", flexDirection: "column", padding: "4px", gap: "4px" }}>
        {selected ? (
          <>
            <div style={{ display: "flex", gap: "4px" }}>
              <input
                type="text"
                value={selected.title}
                onChange={(e) => updateSelected({ title: e.target.value })}
                style={{ flex: 1, fontWeight: "bold" }}
              />
              <select
                value={selected.language}
                onChange={(e) => updateSelected({ language: e.target.value })}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
              </select>
            </div>
            <textarea
              value={selected.code}
              onChange={(e) => updateSelected({ code: e.target.value })}
              style={{
                flex: 1,
                resize: "none",
                fontFamily: "Courier New, monospace",
                fontSize: "12px",
                backgroundColor: "#1e1e1e",
                color: "#d4d4d4",
              }}
            />
          </>
        ) : (
          <div style={{ color: "#808080", padding: "12px" }}>
            Select or create a code file.
          </div>
        )}
      </section>
    </div>
  );
}
