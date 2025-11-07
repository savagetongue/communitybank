import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Member, AuthResponse } from '@shared/types';
interface AuthState {
  user: Member | null;
  token: string | null;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (authResponse) => set({ user: authResponse.member, token: authResponse.token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);