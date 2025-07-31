"use client";

import { create } from 'zustand';

interface User {
  role: string;
  id: number;
  name: string;
  email: string;
  balance: number;
  affiliateBalance: number | null;
  affiliateLink: string | null;
  token: string | null;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  updateBalance: (balance: number, affiliateBalance?: number | null) => void;
}

const isValidUser = (data: unknown): data is User => {
  if (!data || typeof data !== 'object') return false;
  const user = data as User;
  return (
    typeof user.role === 'string' &&
    typeof user.id === 'number' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    typeof user.balance === 'number' &&
    (user.affiliateBalance === null || typeof user.affiliateBalance === 'number') &&
    (user.affiliateLink === null || typeof user.affiliateLink === 'string') &&
    (user.token === null || typeof user.token === 'string') &&
    typeof user.emailVerified === 'boolean'
  );
};

export const useAuthStore = create<AuthState>((set) => {
  let initialUser: User | null = null;
  if (typeof window !== 'undefined') {
    try {
      const savedUser = localStorage.getItem('authUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (isValidUser(parsedUser)) {
          initialUser = parsedUser;
        } else {
          localStorage.removeItem('authUser');
        }
      }
    } catch {
      localStorage.removeItem('authUser');
    }
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