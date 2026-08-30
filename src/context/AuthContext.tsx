import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthUser } from '@/lib/store';
import { db } from '@/lib/store';
import type { User } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('sns.books.session');
    if (!token) return null;
    try {
      const session = JSON.parse(token) as { userId: string };
      const record = db.read<User>('users').find((u) => u.id === session.userId);
      if (!record || record.disabled) return null;
      const { passwordHash: _ph, ...rest } = record;
      return { ...rest, token: `uid:${record.id}` };
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  async function hydrate() {
    setLoading(false);
  }

  const value: AuthContextValue = {
    user,
    loading,
    hydrate,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}