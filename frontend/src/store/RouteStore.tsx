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
    time: string | undefined;
    date: string | undefined;
  } | null;
  isSearching: boolean;
  isDetailsLoading: boolean;
  showFullRoute: boolean;
  error: string | null;
  
  searchTrips: (params: TripSearchParams, fromStop: Stop, toStop: Stop) => Promise<void>;
  selectTrip: (trip: MatchingTrip | null) => void;
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
    
    if (res.matching_trips.length > 0) {
      const detailsPromises = res.matching_trips.map(async (trip) => {
        const firstTripId = trip.trip_ids[0];
        try {
          const details = await stopApi.getTripDetails(firstTripId);
          return {
            ...trip,
            details: details,
          };
        } catch (error) {
          console.error(`Error loading details for trip ${firstTripId}:`, error);
          return {
            ...trip,
            details: null,
          };
        }
      });

      const tripsWithDetails = await Promise.all(detailsPromises);
      
      set({
        matchingTrips: tripsWithDetails,
        searchParams: {
          from_stop: fromStop,
          to_stop: toStop,
          date: params.date,
          time: params.time,
        },
        isSearching: false,
        tripDetails: null,
      });
      
      toast.success(`Znaleziono ${tripsWithDetails.length} połączeń`);
    } else {
      set({
        matchingTrips: [],
        searchParams: {
          from_stop: fromStop,
          to_stop: toStop,
          date: params.date,
          time: params.time,
        },
        isSearching: false,
        tripDetails: null,
      });
      toast.error('Nie znaleziono połączeń dla wybranych kryteriów');
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

selectTrip: (trip) => {
  if (!trip) {
    set({ tripDetails: null });
    return;
  }
  
  set({
    tripDetails: trip.details || null,
    isDetailsLoading: false,
  });
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