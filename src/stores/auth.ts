import { create } from 'zustand';

interface User {
  role: string;
  id: number;
  name: string;
  email: string;
  balance: number;
  affiliateBalance: number;
  affiliateLink: string | null;
  token: string | null;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  updateBalance: (balance: number, affiliateBalance?: number) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  let initialUser: User | null = null;
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('authUser');
    initialUser = savedUser ? (JSON.parse(savedUser) as User) : null;
  }

  return {
    user: initialUser,
    setUser: (user) => {
      if (typeof window !== 'undefined') {
        if (user) {
          localStorage.setItem('authUser', JSON.stringify(user));
        } else {
          localStorage.removeItem('authUser');
        }
      }
      set({ user });
    },
    updateBalance: (balance, affiliateBalance) =>
      set((state) => ({
        user: state.user
          ? { ...state.user, balance, affiliateBalance: affiliateBalance ?? state.user.affiliateBalance }
          : null,
      })),
  };
});