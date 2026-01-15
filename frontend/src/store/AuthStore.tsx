import { create } from 'zustand';
import { authAPI } from '../services/api';
import type {
  User,
  RegisterData,
  LoginData,
} from '../types';
import axios from 'axios';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  showAuthModal: boolean;

  checkAuth: () => Promise<void>;
  login: (data: LoginData) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  requireAuth: (callback: () => void) => void;
  setShowAuthModal: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  showAuthModal: false,

  checkAuth: async () => {
    const sessionId = localStorage.getItem('session_id');

    if (!sessionId) {
      set({ loading: false });
      return;
    }

    try {
      const res = await authAPI.getProfile();
      set({ user: res.data.user });
    } catch (error) {
      console.error('Auth check failed', error);
      localStorage.removeItem('session_id');
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  login: async (data) => {
    try {
      const res = await authAPI.login(data);
      localStorage.setItem('session_id', res.session_id);

      const profile = await authAPI.getProfile();
      set({
        user: profile.data.user,
        showAuthModal: false,
      });

      return { success: true };
    } catch (error: unknown) {
  if (axios.isAxiosError<{ error: string }>(error)) {
    return {
      success: false,
      error: error.response?.data?.error || 'Błąd logowania',
    };
  }

  return {
    success: false,
    error: 'Błąd logowania',
  };
}
  },

  register: async (data) => {
    try {
      const res = await authAPI.register(data);
      localStorage.setItem('session_id', res.session_id);

      const profile = await authAPI.getProfile();
      set({
        user: profile.data.user,
        showAuthModal: false,
      });

      return { success: true };
    } catch (error) {
      if (axios.isAxiosError<{ error: string }>(error)) {
        return {
          success: false,
          error: error.response?.data?.error || 'Błąd rejestracji',
        };
      }
      return {
        success: false,
        error: 'Błąd rejestracji',
      };
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('session_id');
      set({ user: null });
    }
  },

  requireAuth: (callback) => {
    const { user } = get();
    if (user) callback();
    else set({ showAuthModal: true });
  },

  setShowAuthModal: (value) => {
    set({ showAuthModal: value });
  },
}));
