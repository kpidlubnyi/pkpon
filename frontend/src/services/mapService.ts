import axios from "axios";
import type { Stop } from "../types/mapTypes";

export const getStops = async (): Promise<{stops: Stop[]}> => {
    const res = await axios.get('http://localhost:8001/stops/')
    return res.data
}

