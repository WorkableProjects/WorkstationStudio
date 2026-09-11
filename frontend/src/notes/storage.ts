export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

const KEY = "workstation-studio-notes";

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Note[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]) {
  localStorage.setItem(KEY, JSON.stringify(notes));
}

export function createNote(): Note {
  return {
    id: crypto.randomUUID(),
    title: "Untitled",
    body: "",
    updatedAt: Date.now(),
  };
}
