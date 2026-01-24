import { create } from 'zustand'
import type { GetScheduleRes, Stop } from '../types'
import { stopApi } from '../services/mapService'
import type { StopinfoOptions } from '../types'
interface StopsState {
  stops: Stop[]
  selectedStop: Stop | null
  selectedStopSchedule: GetScheduleRes | null
  setStops: (stops: Stop[]) => void
  selectStopById: (id: string) => void
  getStops: () => Promise<void>
  getStopInfo: (stopId: string, options?: StopinfoOptions ) => Promise<void>
  clearSelectedSchedule: () => void
}

export const useStopsStore = create<StopsState>((set, get) => ({
  stops: [],
  selectedStop: null,
  selectedStopSchedule: null,

  setStops: (stops) => set({ stops }),

  selectStopById: (id) => {
    const stop = get().stops.find(s => s.stop_id === id) || null
    set({ selectedStop: stop })
  },

  getStops: async () => {
    const res = await stopApi.getStops();
    set({stops: res.stops})
  },

  getStopInfo: async (stopId: string , options?: StopinfoOptions) => {
    const stop = get().stops.find(s => s.stop_id === stopId) || null

    const schedule = await stopApi.getStopInfo(stopId, options);

    set({ selectedStop: stop, selectedStopSchedule: schedule })
  },

  clearSelectedSchedule: () => set({
    selectedStop: null,
    selectedStopSchedule: null
  })
}))
