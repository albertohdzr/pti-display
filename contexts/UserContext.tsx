"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth";

import { auth } from "@/lib/firebaseClient";
import { UserData } from "@/types";

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  updateUser: (userData: Partial<UserData>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (userData: Partial<UserData>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...userData } : null));
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await fetch("/api/auth/token", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const { customToken, userData } = await response.json();

          if (customToken) {
            await signInWithCustomToken(auth, customToken);
            setUser(userData as UserData);
          } else {
            setUser(null);
          }
        } else {
          await response.json();

          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
