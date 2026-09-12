import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { users, type User } from "./mock";
import { useTranslation } from "./i18n";

interface AuthContext {
  user: User | null;
  login: (email: string) => { ok: boolean; error?: string };
  register: (data: { firstName: string; lastName: string; email: string }) => { ok: boolean; error?: string };
  logout: () => void;
  switchUser: (id: string) => void; // demo helper
}

const Ctx = createContext<AuthContext | null>(null);
const STORAGE_KEY = "imilearn.currentUserId";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.localStorage.getItem(STORAGE_KEY);
    if (id) {
      const u = users.find((x) => x.id === id);
      if (u) setUser(u);
    }
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (typeof window !== "undefined") {
      if (u) window.localStorage.setItem(STORAGE_KEY, u.id);
      else window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value: AuthContext = {
    user,
    login: (email) => {
      const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
      if (!u) return { ok: false, error: t("auth.noAccountWithEmail") };
      persist(u);
      return { ok: true };
    },
    register: ({ firstName, lastName, email }) => {
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, error: t("auth.emailTaken") };
      }
      const u: User = { id: `u_${Date.now()}`, firstName, lastName, email, role: "student" };
      users.push(u);
      persist(u);
      return { ok: true };
    },
    logout: () => persist(null),
    switchUser: (id) => {
      const u = users.find((x) => x.id === id);
      if (u) persist(u);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
