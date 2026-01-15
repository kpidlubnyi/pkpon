import axios from "axios";
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { AuthResponse, LoginData, LogoutResponse, RegisterData, UserProfileResponse } from "../types";

export const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8001/',
    withCredentials: true,
    headers: {
        "Content-Type": 'application/json',
    },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => { 
    const sessionId = localStorage.getItem('session_id');
    if (sessionId && config.headers) {
        config.headers.Authorization = `Session ${sessionId}`;
    }
    return config;
}, 
    (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use((response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('session_id');

        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: async (userData: RegisterData): Promise<AuthResponse> => {
        const res = await api.post<AuthResponse>('users/signup', userData)
        return res.data;
    },

    login: async (credentials: LoginData): Promise<AuthResponse> => {
        const res = await api.post<AuthResponse>('users/login', credentials);
        return res.data;
    },

    logout: async (): Promise<LogoutResponse> => {
        const res = await api.post<LogoutResponse>('users/logout');
            return res.data;
    },

    getProfile: () => api.get<UserProfileResponse>('users/profile'),
}