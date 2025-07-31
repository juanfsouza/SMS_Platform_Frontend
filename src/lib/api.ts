import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/auth';

const api: AxiosInstance = axios.create({
  baseURL: 'https://www.findexsms.com/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = useAuthStore.getState().user?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;