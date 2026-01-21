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

export interface UserProfileResponse {
    user: User;
}

export interface LogoutResponse {
    message: string;
}

export interface User {
    user_id: string;
    username: string;
    email: string;
    created_at?: string;
}

export type Stop = {
    stop_id: string,
    stop_name: string,
    stop_lat: number,
    stop_lng: number,
}

export type GetStopsResponse = {
  stops: Stop[]
}

export type Schedule = {
    trip_id: string,
    arrival_time: string,
    departure_time: string,
    platform: number,
    trac: number,
    vehicle_kind: string
}

export type GetScheduleRes = {
    schedule: Schedule[];
}