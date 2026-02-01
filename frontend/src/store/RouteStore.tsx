import { create } from 'zustand';
import type { MatchingTrip, TripSearchParams, Stop, TripDetails } from '../types';
import { stopApi } from '../services/mapService';
import toast from 'react-hot-toast';

interface RouteState {
  matchingTrips: MatchingTrip[];
  tripDetails: TripDetails | null;
  searchParams: {
    from_stop: Stop | null;
    to_stop: Stop | null;
  } | null;
  isSearching: boolean;
  isDetailsLoading: boolean;
  showFullRoute: boolean;
  error: string | null;
  
  searchTrips: (params: TripSearchParams, fromStop: Stop, toStop: Stop) => Promise<void>;
  selectTrip: (trip: MatchingTrip | null) => Promise<void>;
  clearTrips: () => void;
  setShowFullRoute: (show: boolean) => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  matchingTrips: [],
  tripDetails: null,
  searchParams: null,
  isSearching: false,
  isDetailsLoading: false,
  showFullRoute: false,
  error: null,
  
  setShowFullRoute: (show) => set({ showFullRoute: show }),
  
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
      });
      console.log(res.matching_trips)
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
      });
    }
  },

  selectTrip: async (trip) => {
    if (!trip) {
      set({ tripDetails: null });
      return
    }
    const firstTripId = trip.trip_ids[0];
    console.log(trip);
      try {
      const details = await stopApi.getTripDetails(firstTripId);
      set({
        tripDetails: details,
        isDetailsLoading: false, 
      })
      console.log(details);
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
      tripDetails: null,
      searchParams: null,
      error: null,
    });
  },
}));