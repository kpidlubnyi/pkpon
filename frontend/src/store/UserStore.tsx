import { create } from 'zustand';
import { authAPI } from '../services/authService.ts';
import type {
  User,
  RegisterData,
  LoginData,
} from '../types.ts';
import axios from 'axios';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface DRFValidationError {
  [key: string]: string[] | string | undefined; 
  non_field_errors?: string[];
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

export const useUserStore = create<AuthState>((set, get) => ({
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
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as DRFValidationError;

    const fieldErrors = Object.entries(data)
      .filter(([, value]) => Array.isArray(value))
      .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`);

    const generalError = typeof data.error === 'string' ? data.error : 
                           Array.isArray(data.error) ? data.error.join(', ') : 
                           Array.isArray(data.non_field_errors) ? data.non_field_errors.join(', ') : '';

    const message = fieldErrors.length > 0
      ? fieldErrors.join(' | ')
      : generalError || 'Błąd rejestracji';

    return { success: false, error: message };
  }

  return { success: false, error: 'Błąd rejestracji' };
  };
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
  } catch (error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as DRFValidationError;

    const fieldErrors = Object.entries(data)
      .filter(([, value]) => Array.isArray(value))
      .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`);

    const generalError = typeof data.error === 'string' ? data.error : 
                           Array.isArray(data.error) ? data.error.join(', ') : 
                           Array.isArray(data.non_field_errors) ? data.non_field_errors.join(', ') : '';

    const message = fieldErrors.length > 0
      ? fieldErrors.join(' | ')
      : generalError || 'Błąd rejestracji';

    return { success: false, error: message };
  }

  return { success: false, error: 'Błąd rejestracji' };
  };
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
