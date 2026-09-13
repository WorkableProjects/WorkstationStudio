import { useEffect, useState, useMemo } from "react";
import { useUser } from "../context/UserContext";

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "Low" | "Medium" | "High" | "Urgent";
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  category: string;
  repeat: "none" | "daily" | "weekly" | "monthly";
  subtasks: SubTask[];
  createdAt: number;
  notified?: boolean;
}

interface Props {
  onTriggerNotification?: (title: string, message: string, taskId: string) => void;
}

export function TodoApp({ onTriggerNotification }: Props) {
  const { getUserStorageItem, setUserStorageItem, currentUser } = useUser();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [viewMode, setViewMode] = useState<"agenda" | "calendar">("agenda");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterQuick, setFilterQuick] = useState<"all" | "today" | "week" | "overdue">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [lastCompletedTask, setLastCompletedTask] = useState<TaskItem | null>(null);
  const [undoTimer, setUndoTimer] = useState<number | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDueTime, setNewDueTime] = useState("");
  const [newCategory, setNewCategory] = useState("Work");

  useEffect(() => {
    const saved = getUserStorageItem("todo_tasks_v2");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        setTasks([]);
      }
    } else {
      const todayStr = new Date().toISOString().slice(0, 10);
      setTasks([
        {
          id: "1",
          title: "Complete Workstation Studio 0.0.3.667.8 Release",
          description: "Major UI/UX overhaul and full app suite upgrade.",
          completed: false,
          priority: "Urgent",
          dueDate: todayStr,
          dueTime: "18:00",
          category: "Work",
          repeat: "none",
          subtasks: [
            { id: "s1", text: "Start Menu left alignment", completed: true },
            { id: "s2", text: "Time-based task notifications", completed: true },
          ],
          createdAt: Date.now(),
        },
      ]);
    }
  }, [currentUser]);

  const saveTasks = (items: TaskItem[]) => {
    setTasks(items);
    setUserStorageItem("todo_tasks_v2", JSON.stringify(items));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currDate = now.toISOString().slice(0, 10);
      const currTime = now.toTimeString().slice(0, 5);

      tasks.forEach((task) => {
        if (!task.completed && !task.notified && task.dueDate === currDate && task.dueTime === currTime) {
          if (onTriggerNotification) {
            onTriggerNotification(`Task Due: ${task.title}`, task.description || "Task due time has arrived!", task.id);
          }
          const updated = tasks.map((t) => (t.id === task.id ? { ...t, notified: true } : t));
          saveTasks(updated);
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [tasks, onTriggerNotification]);

  const addTask = () => {
    if (!newTitle.trim()) return;
    const newTask: TaskItem = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      description: newDesc,
      completed: false,
      priority: newPriority,
      dueDate: newDueDate || new Date().toISOString().slice(0, 10),
      dueTime: newDueTime || "12:00",
      category: newCategory,
      repeat: "none",
      subtasks: [],
      createdAt: Date.now(),
    };
    saveTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewDesc("");
  };

  const toggleTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    if (!target.completed) {
      setLastCompletedTask(target);
      if (undoTimer) clearTimeout(undoTimer);
      const timer = window.setTimeout(() => setLastCompletedTask(null), 30000);
      setUndoTimer(timer);
    }

    saveTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleUndoComplete = () => {
    if (!lastCompletedTask) return;
    saveTasks(tasks.map((t) => (t.id === lastCompletedTask.id ? { ...t, completed: false } : t)));
    setLastCompletedTask(null);
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id));
  };

  const addSubtask = (taskId: string) => {
    const text = prompt("Enter sub-task checklist item:");
    if (!text || !text.trim()) return;
    saveTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: [...t.subtasks, { id: crypto.randomUUID(), text: text.trim(), completed: false }],
        };
      })
    );
  };

  const toggleSubtask = (taskId: string, subId: string) => {
    saveTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s)),
        };
      })
    );
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterCategory !== "All" && t.category !== filterCategory) return false;

      if (filterQuick === "today" && t.dueDate !== todayStr) return false;
      if (filterQuick === "overdue" && (!t.dueDate || t.dueDate >= todayStr || t.completed)) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return t.title.toLowerCase().includes(term) || (t.description && t.description.toLowerCase().includes(term));
      }
      return true;
    });
  }, [tasks, filterCategory, filterQuick, searchTerm, todayStr]);

  const priorityColor = (p: TaskItem["priority"]) => {
    switch (p) {
      case "Urgent": return "#cc0000";
      case "High": return "#ff6600";
      case "Medium": return "#008000";
      case "Low": return "#606060";
    }
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
        fontSize: "11px",
      }}
    >
      {lastCompletedTask && (
        <div
          style={{
            backgroundColor: "#ffffc0",
            padding: "4px 8px",
            border: "1px solid #c0c000",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Completed "{lastCompletedTask.title}"</span>
          <button type="button" onClick={handleUndoComplete} style={{ fontSize: "10px" }}>
            Undo (30s)
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setViewMode(viewMode === "agenda" ? "calendar" : "agenda")}
        >
          View: {viewMode.toUpperCase()}
        </button>

        <select value={filterQuick} onChange={(e: any) => setFilterQuick(e.target.value)}>
          <option value="all">All Tasks</option>
          <option value="today">Due Today</option>
          <option value="overdue">Overdue</option>
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>

        <input
          type="search"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <div className="inset-border" style={{ backgroundColor: "#ffffff", padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          <input
            type="text"
            placeholder="Task Title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ flex: 1, fontWeight: "bold" }}
          />
          <button type="button" onClick={addTask} style={{ fontWeight: "bold" }}>
            Add Task
          </button>
        </div>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <span>Priority:</span>
          <select value={newPriority} onChange={(e: any) => setNewPriority(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <span>Category:</span>
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
          </select>

          <span>Due Date:</span>
          <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} style={{ fontSize: "11px" }} />

          <span>Time:</span>
          <input type="time" value={newDueTime} onChange={(e) => setNewDueTime(e.target.value)} style={{ fontSize: "11px" }} />
        </div>
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
        {filteredTasks.map((t) => {
          const isOverdue = !t.completed && t.dueDate && t.dueDate < todayStr;
          return (
            <div
              key={t.id}
              style={{
                padding: "6px",
                backgroundColor: t.completed ? "#f5f5f5" : "#ffffff",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, cursor: "pointer" }}>
                  <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id)} />
                  <span
                    style={{
                      fontWeight: "bold",
                      textDecoration: t.completed ? "line-through" : "none",
                      color: t.completed ? "#808080" : isOverdue ? "red" : "#000000",
                    }}
                  >
                    {t.title}
                  </span>
                  {isOverdue && <span style={{ color: "red", fontSize: "10px", fontWeight: "bold" }}>[OVERDUE]</span>}
                </label>

                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button type="button" onClick={() => addSubtask(t.id)} style={{ fontSize: "9px" }}>
                    + Sub-item
                  </button>
                  <span
                    style={{
                      backgroundColor: priorityColor(t.priority),
                      color: "#ffffff",
                      padding: "1px 4px",
                      fontSize: "9px",
                      borderRadius: "2px",
                      fontWeight: "bold",
                    }}
                  >
                    {t.priority}
                  </span>
                  <span style={{ fontSize: "10px", color: "#606060" }}>
                    📅 {t.dueDate} {t.dueTime}
                  </span>
                  <button type="button" onClick={() => deleteTask(t.id)} style={{ fontSize: "9px" }}>
                    ✕
                  </button>
                </div>
              </div>

              {t.description && (
                <div style={{ color: "#606060", fontSize: "10px", marginLeft: "22px" }}>{t.description}</div>
              )}

              <div style={{ marginLeft: "22px", display: "flex", flexDirection: "column", gap: "2px" }}>
                {t.subtasks?.map((st) => (
                  <label key={st.id} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px" }}>
                    <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(t.id, st.id)} />
                    <span style={{ textDecoration: st.completed ? "line-through" : "none" }}>{st.text}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div style={{ color: "#808080", padding: "12px", textAlign: "center" }}>
            No tasks matching current filter for user: {currentUser}
          </div>
        )}
      </div>
    </div>
  );
}
