import { useEffect, useMemo } from 'react';
import { Polyline } from 'react-leaflet';
import { useRouteStore } from '../../store/RouteStore';
import polyline from '@mapbox/polyline';

const SEGMENT_COLORS = ['#3a62ff', '#ff5719', '#a323ff', '#ff006e', '#8338ec'];

export const TripPolyline = () => {
  const { selectedTrip, tripDetails, loadDetails, searchParams } = useRouteStore();

  useEffect(() => {
    if (selectedTrip && !tripDetails) {
      const firstTripId = selectedTrip.trip_ids[0];
      void loadDetails(firstTripId);
    }
  }, [selectedTrip, tripDetails, loadDetails]);

  const segments = useMemo<Array<{ positions: [number, number][]; color: string }>>(() => {
    if (!tripDetails?.polylines || !tripDetails?.trip_stop_times || !searchParams) {
      return [];
    }

    const fromStopId = searchParams.from_stop?.stop_id;
    const toStopId = searchParams.to_stop?.stop_id;

    if (!fromStopId || !toStopId) {
      return [];
    }

    const trimPolylineForTrip = (
      encodedPolyline: string,
      tripId: string,
      fromStopId: string,
      toStopId: string
    ): [number, number][] => {
      const allPositions = polyline.decode(encodedPolyline);
      const stopTimes = tripDetails.trip_stop_times[tripId];

      if (!stopTimes) {
        return allPositions;
      }

      let fromStop = null;
      let toStop = null;

      for (const st of stopTimes) {
        if (st.stop.stop_id === fromStopId) {
          fromStop = { coords: [st.stop.stop_lat, st.stop.stop_lng] as [number, number] };
        }
        if (st.stop.stop_id === toStopId) {
          toStop = { coords: [st.stop.stop_lat, st.stop.stop_lng] as [number, number] };
        }
      }

      if (!fromStop && !toStop) {
        return allPositions;
      }

      if (!fromStop || !toStop) {
        const firstStop = stopTimes[0];
        const lastStop = stopTimes[stopTimes.length - 1];

        if (!fromStop) {
          fromStop = { coords: [firstStop.stop.stop_lat, firstStop.stop.stop_lng] as [number, number] };
        }
        if (!toStop) {
          toStop = { coords: [lastStop.stop.stop_lat, lastStop.stop.stop_lng] as [number, number] };
        }
      }

      const findNearestPointIndex = (coords: [number, number]) => {
        let minDistance = Infinity;
        let nearestIndex = 0;

        allPositions.forEach((pos, index) => {
          const distance = Math.sqrt(
            Math.pow(pos[0] - coords[0], 2) + Math.pow(pos[1] - coords[1], 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
          }
        });

        return nearestIndex;
      };

      const fromIndex = findNearestPointIndex(fromStop.coords);
      const toIndex = findNearestPointIndex(toStop.coords);

      return allPositions.slice(
        Math.min(fromIndex, toIndex),
        Math.max(fromIndex, toIndex) + 1
      );
    };

    const segments = tripDetails.polylines.map((encodedPolyline, index) => {
      const tripId = Object.keys(tripDetails.trip_stop_times)[index];
      const trimmedPositions = trimPolylineForTrip(
        encodedPolyline,
        tripId,
        fromStopId,
        toStopId
      );

      return {
        positions: trimmedPositions,
        color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
      };
    });

    return segments;
  }, [tripDetails, searchParams]);

  if (segments.length === 0) {
    return null;
  }

  return (
    <>
      {segments.map((segment, index) => (
        <Polyline
          key={index}
          positions={segment.positions}
          pathOptions={{
            color: segment.color,
            weight: 5,
            opacity: 0.8,
          }}
        />
      ))}
    </>
  );
};