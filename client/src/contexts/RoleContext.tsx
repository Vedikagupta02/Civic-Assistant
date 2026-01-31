import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'worker' | 'user';

interface RoleContextType {
  role: UserRole;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function inferRole(email?: string | null): UserRole {
  if (!email) return 'user';
  const e = email.toLowerCase();
  if (e.includes('admin')) return 'admin';
  if (e.includes('worker')) return 'worker';
  return 'user';
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const role = useMemo(() => {
    // URL query override (?role=admin|worker|user)
    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get('role') as UserRole | null;
      if (fromQuery && ['admin','worker','user'].includes(fromQuery)) {
        return fromQuery as UserRole;
      }
    } catch {}

    // LocalStorage override
    try {
      const fromStorage = localStorage.getItem('roleOverride') as UserRole | null;
      if (fromStorage && ['admin','worker','user'].includes(fromStorage)) {
        return fromStorage as UserRole;
      }
    } catch {}

    // Default: infer from email
    return inferRole(user?.email);
  }, [user?.email]);
  return <RoleContext.Provider value={{ role }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within a RoleProvider');
  return ctx;
}
