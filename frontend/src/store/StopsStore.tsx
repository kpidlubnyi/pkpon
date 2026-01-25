import { create } from 'zustand'
import type { GetScheduleRes, Stop } from '../types'
import { stopApi } from '../services/mapService'
import type { StopinfoOptions } from '../types'
import toast from 'react-hot-toast';

interface StopsState {
  stops: Stop[]
  selectedStop: Stop | null
  selectedStopSchedule: GetScheduleRes | null
  isStopsLoading: boolean
  error: string | null
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
  isStopsLoading: false,
  error: null,

  setStops: (stops) => set({ stops }),

  selectStopById: (id) => {
    const stop = get().stops.find(s => s.stop_id === id) || null
    set({ selectedStop: stop })
  },

  getStops: async () => {
    set({isStopsLoading: true})
    try {
      const res = await stopApi.getStops();
    set({stops: res.stops, isStopsLoading: false})
    } catch (error) {
      console.error('Error fetching stops', error)
      toast.error('Nie udało sie pobrać stacji')
      set({isStopsLoading: false})
    }
  },

  getStopInfo: async (stopId: string , options?: StopinfoOptions) => {
   set({ isStopsLoading: true })
    try {
      const stop = get().stops.find(s => s.stop_id === stopId) || null
      const schedule = await stopApi.getStopInfo(stopId, options)

      set({ 
        selectedStop: stop, 
        selectedStopSchedule: schedule,
        isStopsLoading: false 
      })
    } catch (error) {
      console.error('Error fetching stop info:', error)
      toast.error('Nie udało się pobrać rozkładu jazdy')
      set({ isStopsLoading: false })
    }
  },

  clearSelectedSchedule: () => set({
    selectedStop: null,
    selectedStopSchedule: null
  })
}))
