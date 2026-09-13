import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  currentUser: string;
  users: string[];
  isLoggedIn: boolean;
  createUser: (username: string) => void;
  switchUser: (username: string) => void;
  deleteUser: (username: string) => void;
  login: (username: string) => void;
  logout: () => void;
  getUserStorageItem: (key: string) => string | null;
  setUserStorageItem: (key: string, value: string) => void;
}

const STORAGE_KEY_CURRENT_USER = "workstation_current_user";
const STORAGE_KEY_USERS = "workstation_users_list";
const STORAGE_KEY_LOGGED_IN = "workstation_logged_in";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return ["default_user"];
  });

  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_CURRENT_USER) || "default_user";
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_LOGGED_IN) === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, currentUser);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGGED_IN, String(isLoggedIn));
  }, [isLoggedIn]);

  const createUser = (username: string) => {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!clean) return;
    if (!users.includes(clean)) {
      setUsers([...users, clean]);
    }
    setCurrentUser(clean);
    setIsLoggedIn(true);
  };

  const switchUser = (username: string) => {
    if (users.includes(username)) {
      setCurrentUser(username);
      setIsLoggedIn(true);
    }
  };

  const deleteUser = (username: string) => {
    if (users.length <= 1) return;
    const filtered = users.filter((u) => u !== username);
    setUsers(filtered);
    if (currentUser === username) {
      setCurrentUser(filtered[0]);
    }
  };

  const login = (username: string) => {
    if (users.includes(username)) {
      setCurrentUser(username);
      setIsLoggedIn(true);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const getUserStorageKey = (key: string) => `.studio/${currentUser}/${key}`;

  const getUserStorageItem = (key: string): string | null => {
    return localStorage.getItem(getUserStorageKey(key));
  };

  const setUserStorageItem = (key: string, value: string): void => {
    localStorage.setItem(getUserStorageKey(key), value);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        isLoggedIn,
        createUser,
        switchUser,
        deleteUser,
        login,
        logout,
        getUserStorageItem,
        setUserStorageItem,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    return {
      currentUser: "default_user",
      users: ["default_user"],
      isLoggedIn: true,
      createUser: () => {},
      switchUser: () => {},
      deleteUser: () => {},
      login: () => {},
      logout: () => {},
      getUserStorageItem: (key: string) => localStorage.getItem(`.studio/default_user/${key}`),
      setUserStorageItem: (key: string, value: string) =>
        localStorage.setItem(`.studio/default_user/${key}`, value),
    };
  }
  return context;
}
