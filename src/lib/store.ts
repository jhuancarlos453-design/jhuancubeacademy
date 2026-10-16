import { useCallback, useEffect, useState } from "react";
import type { Solve } from "./cube";

export interface Cube { id: string; brand: string; model: string; category: string; magnetic: boolean; notes: string }
export interface UserData {
  solves: Solve[];
  progress: Record<string, "know" | "learning">;
  cubes: Cube[];
  activeCubeId: string | null;
  inspection: boolean;
  quizBestStreak: number;
  quizCorrect: number;
}
export interface User { email: string; name: string; password: string; google?: boolean }

const USERS = "jcca_users";
const SESSION = "jcca_session";
const dataKey = (email: string) => `jcca_data_${email}`;

export const emptyData = (): UserData => ({ solves: [], progress: {}, cubes: [], activeCubeId: null, inspection: false, quizBestStreak: 0, quizCorrect: 0 });

function readUsers(): Record<string, User> {
  try { return JSON.parse(localStorage.getItem(USERS) || "{}"); } catch { return {}; }
}

export function useApp() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<UserData>(emptyData);

  const load = (u: User | null) => {
    setUser(u);
    if (u) {
      try { setData({ ...emptyData(), ...JSON.parse(localStorage.getItem(dataKey(u.email)) || "{}") }); } catch { setData(emptyData()); }
    }
  };

  useEffect(() => {
    const email = localStorage.getItem(SESSION);
    load(email ? readUsers()[email] ?? null : null);
    setReady(true);
  }, []);

  const update = useCallback((fn: (d: UserData) => UserData) => {
    setData((prev) => {
      const next = fn(prev);
      const email = localStorage.getItem(SESSION);
      if (email) localStorage.setItem(dataKey(email), JSON.stringify(next));
      return next;
    });
  }, []);

  const signup = (name: string, email: string, password: string) => {
    const users = readUsers();
    const key = email.trim().toLowerCase();
    if (users[key]) throw new Error("Já existe uma conta com este e-mail.");
    users[key] = { name: name.trim(), email: key, password };
    localStorage.setItem(USERS, JSON.stringify(users));
    localStorage.setItem(SESSION, key);
    load(users[key]);
  };
  const login = (email: string, password: string) => {
    const key = email.trim().toLowerCase();
    const u = readUsers()[key];
    if (!u || u.password !== password) throw new Error("E-mail ou senha incorretos.");
    localStorage.setItem(SESSION, key);
    load(u);
  };
  const loginGoogle = () => {
    const users = readUsers();
    const key = "google.user@gmail.com";
    users[key] ??= { name: "Cubista Google", email: key, password: "", google: true };
    localStorage.setItem(USERS, JSON.stringify(users));
    localStorage.setItem(SESSION, key);
    load(users[key]);
  };
  const logout = () => {
    localStorage.removeItem(SESSION);
    setUser(null);
    setData(emptyData());
  };

  return { ready, user, data, update, signup, login, loginGoogle, logout };
}
export type App = ReturnType<typeof useApp>;

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
