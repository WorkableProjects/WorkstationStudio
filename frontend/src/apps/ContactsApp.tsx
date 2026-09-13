import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export function ContactsApp() {
  const { getUserStorageItem, setUserStorageItem, currentUser } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = getUserStorageItem("address_book_contacts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setContacts(parsed);
        setSelectedId(parsed[0]?.id || null);
      } catch {
        setContacts([]);
      }
    } else {
      const initial: Contact[] = [
        { id: "1", name: "Workstation Admin", email: "admin@workstation.studio", phone: "555-0199" },
      ];
      setContacts(initial);
      setSelectedId("1");
    }
  }, [currentUser]);

  const saveContacts = (list: Contact[]) => {
    setContacts(list);
    setUserStorageItem("address_book_contacts", JSON.stringify(list));
  };

  const selected = contacts.find((c) => c.id === selectedId) || null;

  const addContact = () => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: "New Contact",
      email: "user@domain.com",
      phone: "555-0100",
    };
    saveContacts([newContact, ...contacts]);
    setSelectedId(newContact.id);
  };

  const updateSelected = (patch: Partial<Contact>) => {
    if (!selected) return;
    const updated = contacts.map((c) =>
      c.id === selected.id ? { ...c, ...patch } : c
    );
    saveContacts(updated);
  };

  const deleteContact = () => {
    if (!selected) return;
    const filtered = contacts.filter((c) => c.id !== selected.id);
    saveContacts(filtered);
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
          <button type="button" onClick={addContact} style={{ flex: 1, fontSize: "11px" }}>
            New
          </button>
          <button
            type="button"
            onClick={deleteContact}
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
          {contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              style={{
                padding: "3px 5px",
                cursor: "pointer",
                backgroundColor:
                  c.id === selectedId ? "var(--title-bg-active)" : "transparent",
                color: c.id === selectedId ? "var(--title-fg-active)" : "#000",
                fontSize: "11px",
              }}
            >
              👤 {c.name || "Untitled"}
            </div>
          ))}
        </div>
      </aside>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "8px",
          gap: "8px",
        }}
      >
        {selected ? (
          <>
            <div>
              <label style={{ fontSize: "11px", display: "block", marginBottom: "2px" }}>
                Name:
              </label>
              <input
                type="text"
                value={selected.name}
                onChange={(e) => updateSelected({ name: e.target.value })}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", display: "block", marginBottom: "2px" }}>
                Email:
              </label>
              <input
                type="text"
                value={selected.email}
                onChange={(e) => updateSelected({ email: e.target.value })}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", display: "block", marginBottom: "2px" }}>
                Phone:
              </label>
              <input
                type="text"
                value={selected.phone}
                onChange={(e) => updateSelected({ phone: e.target.value })}
                style={{ width: "100%" }}
              />
            </div>
          </>
        ) : (
          <div style={{ color: "#808080" }}>Select or add a contact.</div>
        )}
      </section>
    </div>
  );
}
