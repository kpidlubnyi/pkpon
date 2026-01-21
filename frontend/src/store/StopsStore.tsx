import { create } from 'zustand'
import type { GetScheduleRes, Stop } from '../types'
import { stopApi } from '../services/mapService'

interface StopsState {
  stops: Stop[]
  selectedStop: Stop | null
  setStops: (stops: Stop[]) => void
  selectStopById: (id: string) => void
  getStops: () => Promise<void>
  getStopInfo: (stopId: string) =>  Promise<GetScheduleRes>
}

export const useStopsStore = create<StopsState>((set, get) => ({
  stops: [],
  selectedStop: null,

  setStops: (stops) => set({ stops }),

  selectStopById: (id) => {
    const stop = get().stops.find(s => s.stop_id === id) || null
    set({ selectedStop: stop })
  },

  getStops: async () => {
    const res = await stopApi.getStops();
    set({stops: res.stops})
  },

  getStopInfo: async (stopId) => {
    const res = await stopApi.getStopInfo(stopId);
    return res
  }
}))
