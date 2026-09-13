import { useState } from "react";
import { useUser } from "../context/UserContext";

export function LoginScreen() {
  const { users, currentUser, login, createUser } = useUser();
  const [selectedUser, setSelectedUser] = useState<string>(currentUser || users[0] || "default_user");
  const [newUsername, setNewUsername] = useState("");

  const handleLogin = () => {
    login(selectedUser);
  };

  const handleAddUser = () => {
    if (!newUsername.trim()) return;
    createUser(newUsername.trim());
    setNewUsername("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--desktop-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999998,
      }}
    >
      <div
        className="outset-border"
        style={{
          width: "420px",
          backgroundColor: "var(--dialog-bg)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            backgroundColor: "#000080",
            color: "#ffffff",
            padding: "4px 8px",
            fontWeight: "bold",
          }}
        >
          Workstation Studio OS - User Sign In
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "8px",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0, 242, 254, 0.4)",
            }}
          >
            <img src="/assets/Logo.png" alt="Workstation Studio" style={{ width: "40px", height: "40px" }} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Select Account</h3>
            <span style={{ fontSize: "11px", opacity: 0.8 }}>
              Choose a profile to sign into your desktop session
            </span>
          </div>
        </div>

        <div
          className="inset-border"
          style={{
            backgroundColor: "#ffffff",
            padding: "6px",
            maxHeight: "150px",
            overflowY: "auto",
          }}
        >
          {users.map((u) => (
            <div
              key={u}
              onClick={() => setSelectedUser(u)}
              style={{
                padding: "6px 8px",
                cursor: "pointer",
                backgroundColor: u === selectedUser ? "var(--title-bg-active)" : "transparent",
                color: u === selectedUser ? "var(--title-fg-active)" : "#000000",
                fontSize: "12px",
                fontWeight: u === selectedUser ? "bold" : "normal",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>👤</span>
              <span>{u}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            placeholder="Create New User..."
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={handleAddUser}>
            + Add
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
          <button
            type="button"
            onClick={handleLogin}
            style={{ padding: "4px 16px", fontWeight: "bold" }}
          >
            Sign In &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
