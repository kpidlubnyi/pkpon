import { create } from 'zustand';
import type { MatchingTrip, TripSearchParams, Stop, TripDetails } from '../types';
import { stopApi } from '../services/mapService';
import toast from 'react-hot-toast';

interface RouteState {
  matchingTrips: MatchingTrip[];
  selectedTrip: MatchingTrip | null;
  tripDetails: TripDetails | null;
  searchParams: {
    from_stop: Stop | null;
    to_stop: Stop | null;
  } | null;
  isSearching: boolean;
  isDetailsLoading: boolean;
  error: string | null;
  
  searchTrips: (params: TripSearchParams, fromStop: Stop, toStop: Stop) => Promise<void>;
  selectTrip: (trip: MatchingTrip | null) => void;
  loadDetails: (tripId: string) => Promise<void>;
  clearTrips: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  matchingTrips: [],
  selectedTrip: null,
  tripDetails: null,
  searchParams: null,
  isSearching: false,
  isDetailsLoading: false,
  error: null,

  searchTrips: async (params: TripSearchParams, fromStop: Stop, toStop: Stop) => {
    set({ isSearching: true, error: null });
    try {
      const res = await stopApi.searchTrips(params);
      
      set({
        matchingTrips: res.matching_trips,
        searchParams: {
          from_stop: fromStop,
          to_stop: toStop,
        },
        isSearching: false,
        selectedTrip: res.matching_trips.length > 0 ? res.matching_trips[0] : null,
        tripDetails: null,
      });
      if (res.matching_trips.length === 0) {
        toast.error('Nie znaleziono połączeń dla wybranych kryteriów');
      } else {
        toast.success(`Znaleziono ${res.matching_trips.length} połączeń`);
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
    set({ selectedTrip: trip, tripDetails: null });
  },

  loadDetails: async (tripId: string) => {
    set({ isDetailsLoading: true });
    try {
      const details = await stopApi.getTripDetails(tripId);
      set({
        tripDetails: details,
        isDetailsLoading: false, 
      })
    } catch (error) {
      console.error('Error loading details for this trip', error);
      set({
        isDetailsLoading: false,
        error: 'Failet to load details',
      });
    }
},
  
  clearTrips: () => {
    set({
      matchingTrips: [],
      selectedTrip: null,
      tripDetails: null,
      searchParams: null,
      error: null,
    });
  },
}));