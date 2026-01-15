// auth requests interfaces
export interface RegisterData {
    email: string;
    password: string;
    username: string
}

export interface LoginData {
    email: string;
    password: string;
}
// expected responses interfaces
export interface AuthResponse {
    session_id: string;
}

export interface User {
    user_id: string;
    username: string;
    email: string;
    created_at?: string;
}

export interface UserProfileResponse {
    user: User;
}

export interface LogoutResponse {
    message: string;
}