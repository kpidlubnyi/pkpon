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
    trip_headsign: string
    trip_id: string,
    arrival_time: string,
    departure_time: string,
    platform: number,
    track: number,
    vehicle_kind: string
}

export type GetScheduleRes = {
    schedule: Schedule[];
}

export interface StopinfoOptions {
  direction?: 'arrivals' | 'departures';
  date?: string | null;
  time?: string | null
}

//Trips types
export interface TripSearchParams {
    from_stop: string;  
    to_stop: string;    
    date?: string;      
    time?: string;   
}

export interface StopTime {
    trip_id: string;
    stop: Stop;
    stop_sequence: number;
    arrival_time: string;
    departure_time: string;
    platform?: number;
    track?: number;
    fare_dist_m?: number;
    vehicle_kind: string;
}

export interface MatchingTrip {
    trip_ids: string[];
    routes: string[];
    legs: number; 
    departure_stop_time: Schedule;  
    arrival_stop_time: Schedule;   
}

export interface TripSearchResponse {
    matching_trips: MatchingTrip[];
}

export interface TripDetails {
    trip_route_name: string;
    trip_short_name: string;
    plk_train_number: string;
    trip_headsign: string | null;
    routes: string[];
    legs: number;
    polylines: string[];
    trip_stop_times: {
        [trip_id: string]: StopTime[];
    };
}