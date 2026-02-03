import type { Stop, StopTime } from '../types';

export interface StopWithTripId {
  stop: Stop;
  arrival_time: string;
  departure_time: string;
  tripId: string;
  stop_sequence: number;
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
        stop_sequence: stop.stop_sequence
      }))
    )
    .sort((a, b) => a.stop_sequence - b.stop_sequence);
}

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