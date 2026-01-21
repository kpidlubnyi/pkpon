import type { GetScheduleRes, GetStopsResponse } from "../types";
import {api} from './authService'


export const stopApi = {
    getStops: async (): Promise<GetStopsResponse> => {
        const res = await api.get<GetStopsResponse>('/stops/')
        return res.data
    },

    getStopInfo: async (stopId: string): Promise<GetScheduleRes> => {
        const res = await api.get<GetScheduleRes>(`/stops/${stopId}/schedule`, {
            params: {
                direction: "departures",
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString()
            }
        })
        return res.data
    }
};

