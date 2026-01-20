import type { Stop } from "../types/mapTypes";
import {api} from './authService'

export const getStops = async (): Promise<{stops: Stop[]}> => {
    const res = await api.get('/stops/')
    return res.data
}

