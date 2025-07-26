import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import type { ReactNode } from "react";

import type UserLocal from "@/types/userlocal";

interface UserContextType {
  user: UserLocal | null;
  updateUser: (updatedFields: Partial<UserLocal>) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserLocal | null>(null);

  // Determine whether data was from localStorage or sessionStorage
  const [storageType, setStorageType] = useState<"local" | "session" | null>(
    null
  );

  useEffect(() => {
    const rawUser =
      localStorage.getItem("User_logged") ||
      sessionStorage.getItem("User_logged");

    if (rawUser) {
      try {
        const parsedUser = JSON.parse(rawUser);
        setUser(parsedUser);
        setStorageType(
          localStorage.getItem("User_logged") ? "local" : "session"
        );
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        setUser(null);
        setStorageType(null);
      }
    }
  }, []);

  const updateUser = (updatedFields: Partial<UserLocal>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);

    const userString = JSON.stringify(updatedUser);

    // Update both storages to stay in sync
    localStorage.setItem("User_logged", userString);
    sessionStorage.setItem("User_logged", userString);
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("User_logged");
    sessionStorage.removeItem("User_logged");
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
