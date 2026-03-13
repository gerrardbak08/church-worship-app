'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { bkend } from '@/lib/bkend';

interface User {
  _id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, accessToken } = await bkend.auth.signin({ email, password });
          localStorage.setItem('bkend_access_token', accessToken);
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await bkend.auth.signout();
        localStorage.removeItem('bkend_access_token');
        set({ user: null });
      },
    }),
    { name: 'auth-storage' }
  )
);
