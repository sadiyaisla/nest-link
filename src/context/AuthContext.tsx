import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, extractErrorMessage, setAuthToken } from '../api/client';
import type { UserDTO } from '../../shared/types';

export interface ToastItem {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AuthContextValue {
  user: UserDTO | null;
  loading: boolean;
  favoriteHostelIds: string[];
  favoriteRoommateIds: string[];
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: number) => void;
  login: (email: string, password: string) => Promise<UserDTO>;
  register: (payload: Record<string, unknown>) => Promise<UserDTO>;
  loginDemo: (role: 'student' | 'owner') => Promise<UserDTO>;
  claimAdmin: (payload: { name: string; email: string; password: string }) => Promise<UserDTO>;
  loginAdmin: (payload: { email?: string; password: string }) => Promise<UserDTO>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  toggleFavorite: (itemType: 'hostel' | 'roommate', itemId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteHostelIds, setFavoriteHostelIds] = useState<string[]>([]);
  const [favoriteRoommateIds, setFavoriteRoommateIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        dismissToast(id);
      }, 4200);
    },
    [dismissToast]
  );

  const refreshFavorites = useCallback(async () => {
    try {
      const res = await api.get('/favorites');
      setFavoriteHostelIds(res.data.hostelIds || []);
      setFavoriteRoommateIds(res.data.roommateIds || []);
    } catch {
      setFavoriteHostelIds([]);
      setFavoriteRoommateIds([]);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      await refreshFavorites();
    } catch {
      setUser(null);
      setFavoriteHostelIds([]);
      setFavoriteRoommateIds([]);
    } finally {
      setLoading(false);
    }
  }, [refreshFavorites]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleSessionResponse = async (data: { token: string; user: UserDTO }) => {
    setAuthToken(data.token);
    setUser(data.user);
    await refreshFavorites();
    return data.user;
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return handleSessionResponse(res.data);
  };

  const register = async (payload: Record<string, unknown>) => {
    const res = await api.post('/auth/register', payload);
    return handleSessionResponse(res.data);
  };

  const loginDemo = async (role: 'student' | 'owner') => {
    const res = await api.post('/auth/demo', { role });
    return handleSessionResponse(res.data);
  };

  const claimAdmin = async (payload: { name: string; email: string; password: string }) => {
    const res = await api.post('/auth/admin/claim', payload);
    return handleSessionResponse(res.data);
  };

  const loginAdmin = async (payload: { email?: string; password: string }) => {
    const res = await api.post('/auth/admin/login', payload);
    return handleSessionResponse(res.data);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAuthToken(null);
      setUser(null);
      setFavoriteHostelIds([]);
      setFavoriteRoommateIds([]);
      showToast('Signed out successfully.', 'info');
    }
  };

  const toggleFavorite = async (itemType: 'hostel' | 'roommate', itemId: string) => {
    if (!user) {
      showToast('Please sign in to save favorites.', 'info');
      return false;
    }
    try {
      const res = await api.post('/favorites/toggle', { itemType, itemId });
      const saved = Boolean(res.data.saved);
      if (itemType === 'hostel') {
        setFavoriteHostelIds((prev) =>
          saved ? [...new Set([...prev, itemId])] : prev.filter((id) => id !== itemId)
        );
      } else {
        setFavoriteRoommateIds((prev) =>
          saved ? [...new Set([...prev, itemId])] : prev.filter((id) => id !== itemId)
        );
      }
      showToast(
        saved ? 'Saved to your favorites.' : 'Removed from your favorites.',
        'success'
      );
      return saved;
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not update favorites.'), 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        favoriteHostelIds,
        favoriteRoommateIds,
        toasts,
        showToast,
        dismissToast,
        login,
        register,
        loginDemo,
        claimAdmin,
        loginAdmin,
        logout,
        refreshUser,
        refreshFavorites,
        toggleFavorite,
      }}
    >
      {children}
      {/* Toast Notification Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg transition-all duration-200 ${
              toast.type === 'success'
                ? 'bg-white border-emerald-200 text-slate-900'
                : toast.type === 'error'
                  ? 'bg-white border-red-200 text-red-700'
                  : 'bg-[#142B4A] border-[#1E3D66] text-white'
            }`}
          >
            <span className="font-medium leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-xs opacity-70 hover:opacity-100 shrink-0 cursor-pointer"
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
