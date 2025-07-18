import { useAuthStore } from '@/stores/auth';
import api from './api';

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;

    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const fullUser = { ...user, role: decodedToken.role, token };

    useAuthStore.getState().setUser(fullUser);
    return fullUser;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const logout = () => {
  useAuthStore.getState().setUser(null);
};