import { create } from 'zustand';
import { authAPI } from '../services/authService.ts';
import type {
  User,
  RegisterData,
  LoginData,
} from '../types.ts';
import toast from 'react-hot-toast';
import { handleApiError } from '../utils/HandleApiError.ts';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthState {
  user: User | null;
  showAuthModal: boolean;
  isUserLoading: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  login: (data: LoginData) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  requireAuth: (callback: () => void) => void;
  setShowAuthModal: (value: boolean) => void;
}

export const useUserStore = create<AuthState>((set, get) => ({
  user: null,
  showAuthModal: false,
  isUserLoading: false,
  error: null,

  checkAuth: async () => {
    const sessionId = localStorage.getItem('session_id');

    if (!sessionId) return;

    try {
      const res = await authAPI.getProfile();
      set({ user: res.data.user });
    } catch (error) {
      console.error('Auth check failed', error);
      localStorage.removeItem('session_id');
      set({ user: null });
    } finally {
      set({ isUserLoading: false });
    }
  },

  login: async (data) => {
    set({isUserLoading: true})
    try {
      const res = await authAPI.login(data);
      localStorage.setItem('session_id', res.session_id);

      const profile = await authAPI.getProfile();
      set({
        isUserLoading: false,
        user: profile.data.user,
        showAuthModal: false,
      });

      toast.success('Zalogowano pomyślnie')
      return { success: true };

    } catch (error: unknown) {
      set({ isUserLoading: false });
    const errorMessage = handleApiError(error, 'Błąd logowania');
    return { success: false, error: errorMessage };
    }
  },

  register: async (data) => {
    set({ isUserLoading: true });
  try {
    const res = await authAPI.register(data);
    localStorage.setItem('session_id', res.session_id);

    const profile = await authAPI.getProfile();
    set({
      user: profile.data.user,
      showAuthModal: false,
      isUserLoading: false,
    });
    toast.success('Zarejestrowano pomyślnie');
    return { success: true };

  } catch (error: unknown) {
    set({ isUserLoading: false });
    const errorMessage = handleApiError(error, "Błąd rejestracji");
    return { success: false, error: errorMessage };
    };
},


  logout: async () => {
    set({ isUserLoading: true });
    try {
      await authAPI.logout();
      localStorage.removeItem('session_id');
      set({ user: null, isUserLoading: false });
      toast.success('Wylogowano');
    } catch (error) {
      console.error('Logout error', error);
      set({ user: null, isUserLoading: false });
      toast.error('Coś poszło nie tak, spróbuj ponownie')
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
