import { create } from 'zustand'
import type { Stop } from '../types'

interface StopsState {
  stops: Stop[]
  selectedStop: Stop | null
  setStops: (stops: Stop[]) => void
  selectStopById: (id: string) => void
}

export const useStopsStore = create<StopsState>((set, get) => ({
  stops: [],
  selectedStop: null,

  setStops: (stops) => set({ stops }),

  selectStopById: (id) => {
    const stop = get().stops.find(s => s.stop_id === id) || null
    set({ selectedStop: stop })
  },
}))
