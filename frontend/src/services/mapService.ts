import type { GetScheduleRes, GetStopsResponse, TripSearchParams, TripSearchResponse } from "../types";
import {api} from './authService'
import type { StopinfoOptions } from "../types";

export const stopApi = {
    getStops: async (): Promise<GetStopsResponse> => {
        const res = await api.get<GetStopsResponse>('/stops/')
        return res.data
    },

    getStopInfo: async (stopId: string, params?: StopinfoOptions): Promise<GetScheduleRes> => {
        const res = await api.get<GetScheduleRes>(`/stops/${stopId}/schedule`, {
            params: {
                direction: params?.direction ?? "departures",
                date: params?.date,
                time: params?.time,
            }
        })
        return res.data
    },

    searchTrips: async (params: TripSearchParams): Promise<TripSearchResponse> => {
        const res = await api.get<TripSearchResponse>('/trips/search/', {
            params: {
                from_stop: params.from_stop,
                to_stop: params.to_stop,
                date: params.date,
                time: params.time,
            }
        });
        return res.data;
    },

    getTripDetails: async (id: string) => {
        const res = await api.get(`/trips/${id}/`);
        return res.data;
    } 
};

