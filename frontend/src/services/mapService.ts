import type { Stop } from "../types";
import {api} from './authService'

export const getStops = async (): Promise<{stops: Stop[]}> => {
    const res = await api.get('/stops/')
    return res.data
}

