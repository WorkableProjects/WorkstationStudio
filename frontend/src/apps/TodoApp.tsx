import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export function TodoApp() {
  const { getUserStorageItem, setUserStorageItem, currentUser } = useUser();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    const saved = getUserStorageItem("todo_tasks");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch {
        setTodos([]);
      }
    } else {
      setTodos([
        { id: "1", text: "Welcome to Workstation Studio Todo", completed: false, createdAt: Date.now() },
        { id: "2", text: "Explore Control Panel and Themes", completed: true, createdAt: Date.now() - 1000 },
      ]);
    }
  }, [currentUser]);

  const saveTodos = (items: TodoItem[]) => {
    setTodos(items);
    setUserStorageItem("todo_tasks", JSON.stringify(items));
  };

  const addTodo = () => {
    if (!inputText.trim()) return;
    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    saveTodos([newItem, ...todos]);
    setInputText("");
  };

  const toggleTodo = (id: string) => {
    saveTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    saveTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "8px",
        gap: "8px",
        backgroundColor: "var(--dialog-bg)",
        fontFamily: "inherit",
      }}
    >
      <div style={{ display: "flex", gap: "6px" }}>
        <input
          type="text"
          placeholder="New Task..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          style={{ flex: 1 }}
        />
        <button type="button" onClick={addTodo} style={{ fontWeight: "bold" }}>
          Add Task
        </button>
      </div>

      <div
        className="inset-border"
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          overflowY: "auto",
          padding: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {todos.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 6px",
              backgroundColor: t.completed ? "#f0f0f0" : "transparent",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTodo(t.id)}
              />
              <span
                style={{
                  textDecoration: t.completed ? "line-through" : "none",
                  color: t.completed ? "#808080" : "#000000",
                }}
              >
                {t.text}
              </span>
            </label>
            <button
              type="button"
              onClick={() => deleteTodo(t.id)}
              style={{ fontSize: "10px", padding: "1px 4px" }}
            >
              ✕
            </button>
          </div>
        ))}
        {todos.length === 0 && (
          <div style={{ color: "#808080", padding: "8px", textAlign: "center", fontSize: "11px" }}>
            No tasks yet for user: {currentUser}
          </div>
        )}
      </div>
    </div>
  );
}
