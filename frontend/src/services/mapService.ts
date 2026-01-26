import type { GetScheduleRes, GetStopsResponse } from "../types";
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
        console.log(res.data)
        return res.data
    }
};

