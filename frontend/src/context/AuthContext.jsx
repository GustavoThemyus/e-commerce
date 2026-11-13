"use client";
import { createContext, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

export const AuthContext = createContext();

const STORAGE_KEY = "auth";

async function request(path, options) {
  const response = await fetch(`${API_URL}/api/${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export function AuthProvider({ children }) {
  // Mesmo padrão do CartContext: começa vazio e lê o localStorage depois de hidratar
  const [isHydrated, setIsHydrated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function restore() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved?.token) {
          // Confirma no backend: o token pode ter expirado ou a conta ter mudado
          const me = await request("auth/me", {
            headers: { Authorization: `Bearer ${saved.token}` },
          });
          setToken(saved.token);
          setUser(me);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setIsHydrated(true);
    }
    restore();
  }, []);

  async function login(email, password) {
    const data = await request("auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token }));
    setToken(data.token);
    setUser(data.user);
  }

  async function register(email, password) {
    await request("auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    await login(email, password);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isHydrated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
