import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface User {
  email: string;
  name: string;
}
interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);