"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

import { useToast } from "@/context/ToastContext";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const getStoredAuth = () => {
  if (typeof window === "undefined") {
    return {
      token: null as string | null,
      user: null as User | null,
    };
  }

  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (storedToken && storedUser && storedUser !== "undefined") {
    try {
      return {
        token: storedToken,
        user: JSON.parse(storedUser) as User,
      };
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  } else if (storedToken && (!storedUser || storedUser === "undefined")) {
    localStorage.removeItem("token");
  }

  return {
    token: null as string | null,
    user: null as User | null,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const storedAuth = getStoredAuth();
      setToken(storedAuth.token);
      setUser(storedAuth.user);
      setLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const nextAuth = getStoredAuth();
      setToken(nextAuth.token);
      setUser(nextAuth.user);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = (nextToken: string, nextUser: User) => {
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));

    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    showToast("Logged out successfully", "success", 2000);

    setTimeout(() => {
      router.push("/");
    }, 800);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
