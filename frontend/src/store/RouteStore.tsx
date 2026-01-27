import { create } from 'zustand';
import type { MatchingTrip, TripSearchParams, Stop } from '../types';
import { stopApi } from '../services/mapService';
import toast from 'react-hot-toast';

interface RouteState {
  matchingTrips: MatchingTrip[];
  selectedTrip: MatchingTrip | null;
  searchParams: {
    from_stop: Stop | null;
    to_stop: Stop | null;
  } | null;
  isSearching: boolean;
  error: string | null;
  
  searchTrips: (params: TripSearchParams, fromStop: Stop, toStop: Stop) => Promise<void>;
  selectTrip: (trip: MatchingTrip | null) => void;
  clearTrips: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  matchingTrips: [],
  selectedTrip: null,
  searchParams: null,
  isSearching: false,
  error: null,

  searchTrips: async (params: TripSearchParams, fromStop: Stop, toStop: Stop) => {
    set({ isSearching: true, error: null });
    try {
      const response = await stopApi.searchTrips(params);
      
      set({
        matchingTrips: response.matching_trips,
        searchParams: {
          from_stop: fromStop,
          to_stop: toStop,
        },
        isSearching: false,
        selectedTrip: response.matching_trips.length > 0 ? response.matching_trips[0] : null,
      });

      if (response.matching_trips.length === 0) {
        toast.error('Nie znaleziono połączeń dla wybranych kryteriów');
      } else {
        toast.success(`Znaleziono ${response.matching_trips.length} połączeń`);
      }
    } catch (error) {
      console.error('Error searching trips:', error);
      toast.error('Nie udało się wyszukać połączeń');
      set({ 
        isSearching: false, 
        error: 'Failed to search trips',
        matchingTrips: [],
        selectedTrip: null,
      });
    }
  },

  selectTrip: (trip) => {
    set({ selectedTrip: trip });
  },

  clearTrips: () => {
    set({
      matchingTrips: [],
      selectedTrip: null,
      searchParams: null,
      error: null,
    });
  },
}));