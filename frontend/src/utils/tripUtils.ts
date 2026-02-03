import type { Stop, StopTime, TripDetails } from '../types';

export interface StopWithTripId {
  stop: Stop;
  arrival_time: string;
  departure_time: string;
  tripId: string;
  stop_sequence: number;
  platform: number | null;
  track: number | null;
}

export interface TransferInfo {
  station: Stop;
  arrivalTime: string;
  departureTime: string;
  departureRoute: string;
  departurePlatform: string | null;
  departureTrack: string | null;
  tripHeadsign: string | null;
}

export function flattenTripStops(
  tripStopTimes: Record<string, StopTime[]>
): StopWithTripId[] {
  return Object.entries(tripStopTimes)
    .flatMap(([tripId, stops]) =>
      stops.map(stop => ({
        stop: stop.stop,
        arrival_time: stop.arrival_time,
        departure_time: stop.departure_time,
        tripId,
        stop_sequence: stop.stop_sequence,
        platform: stop.platform ?? null,
        track: stop.track ?? null,
      }))
    )
    .sort((a, b) => a.stop_sequence - b.stop_sequence);
};

export function getUserJourneyStops(
  tripStopTimes: Record<string, StopTime[]>,
  fromStopId: string,
  toStopId: string
): StopWithTripId[] {
  const allStops = flattenTripStops(tripStopTimes);
  
  const fromIndex = allStops.findIndex(
    stop => stop.stop.stop_id === fromStopId
  );
  const toIndex = allStops.findIndex(
    stop => stop.stop.stop_id === toStopId
  );

  if (fromIndex === -1 || toIndex === -1) {
    return [];
  }

  if (fromIndex >= toIndex) {
    return [];
  }

  return allStops.slice(fromIndex, toIndex + 1);
}

export function removeDuplicateTransferStops(
  stops: StopWithTripId[]
): StopWithTripId[] {
  const result: StopWithTripId[] = [];
  
  for (let i = 0; i < stops.length; i++) {
    const currentStop = stops[i];
    const nextStop = stops[i + 1];
    
    const isTransferStop = 
      nextStop && 
      currentStop.stop.stop_id === nextStop.stop.stop_id &&
      currentStop.tripId !== nextStop.tripId;
    
    if (isTransferStop) {
      continue;
    }
    
    result.push(currentStop);
  }
  
  return result;
}

export function calculateUserTransfers(
  tripStopTimes: Record<string, StopTime[]>,
  fromStopId: string,
  toStopId: string
): number {
  const userStops = getUserJourneyStops(tripStopTimes, fromStopId, toStopId);
  
  if (userStops.length === 0) {
    return 0;
  }

  const uniqueTripIds = new Set(userStops.map(stop => stop.tripId));
  
  return Math.max(0, uniqueTripIds.size - 1);
}

export function getRelevantPolylines(
  tripStopTimes: Record<string, StopTime[]>,
  polylines: string[],
  fromStopId: string,
  toStopId: string
): string[] {
  const tripIds = Object.keys(tripStopTimes);
  const relevantPolylines: string[] = [];

  let foundStart = false;

  for (let i = 0; i < tripIds.length; i++) {
    const tripId = tripIds[i];
    const stops = tripStopTimes[tripId];

    const hasFromStop = stops.some(stop => stop.stop.stop_id === fromStopId);
    const hasToStop = stops.some(stop => stop.stop.stop_id === toStopId);

    if (hasFromStop) {
      foundStart = true;
    }

    if (foundStart && i < polylines.length) {
      relevantPolylines.push(polylines[i]);
    }

    if (hasToStop) {
      break; 
    }
  }

  return relevantPolylines;
}

export function extractTransfers(
  stops: StopWithTripId[],
  details: TripDetails
): TransferInfo[] {
  const transfers: TransferInfo[] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const current = stops[i];
    const next = stops[i + 1];

    if (current.stop.stop_id === next.stop.stop_id && current.tripId !== next.tripId) {
      const arrivalTime = current.arrival_time;
      const departureTime = next.departure_time;

      const nextTripStops = details.trip_stop_times[next.tripId];
      const departureStopDetails = nextTripStops?.find(
        stop => stop.stop.stop_id === next.stop.stop_id
      );

      const nextTripRoute = details.routes?.find((_, index) => {
        const tripIds = Object.keys(details.trip_stop_times);
        return tripIds[index] === next.tripId;
      }) || details.routes[0];

      transfers.push({
        station: current.stop,
        arrivalTime,
        departureTime,
        departureRoute: nextTripRoute,
        departurePlatform: departureStopDetails?.platform != null 
          ? String(departureStopDetails.platform) 
          : null,
        departureTrack: departureStopDetails?.track != null 
          ? String(departureStopDetails.track) 
          : null,
        tripHeadsign: details.trip_headsign,
      });
    }
  }

  return transfers;
}