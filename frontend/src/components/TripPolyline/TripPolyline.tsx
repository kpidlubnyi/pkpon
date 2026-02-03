import { useEffect, useMemo } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import { useRouteStore } from '../../store/RouteStore';
import polyline from '@mapbox/polyline';
import { getRelevantPolylines } from '../../utils/TripUtils';
import L from 'leaflet';

const SEGMENT_COLORS = ['#3a62ff', '#ff5719', '#a323ff', '#ff006e', '#8338ec'];

export const TripPolyline = () => {
  const map = useMap();
  const { tripDetails, searchParams, showFullRoute } = useRouteStore();

  const segments = useMemo<Array<{ positions: [number, number][]; color: string }>>(() => {
    if (!tripDetails?.polylines || !tripDetails?.trip_stop_times || !searchParams) {
      return [];
    }

    if (showFullRoute) {
      return tripDetails.polylines.map((encodedPolyline, index) => {
        const allPositions = polyline.decode(encodedPolyline);
        return {
          positions: allPositions,
          color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
        };
      });
    }

    const fromStopId = searchParams.from_stop?.stop_id;
    const toStopId = searchParams.to_stop?.stop_id;

    if (!fromStopId || !toStopId) {
      return [];
    }

    const relevantPolylines = getRelevantPolylines(
      tripDetails.trip_stop_times,
      tripDetails.polylines,
      fromStopId,
      toStopId
    );

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

    const tripIds = Object.keys(tripDetails.trip_stop_times);
    let foundStart = false;
    const relevantTripIds: string[] = [];

    for (const tripId of tripIds) {
      const stops = tripDetails.trip_stop_times[tripId];
      const hasFromStop = stops.some(stop => stop.stop.stop_id === fromStopId);
      const hasToStop = stops.some(stop => stop.stop.stop_id === toStopId);

      if (hasFromStop) {
        foundStart = true;
      }

      if (foundStart) {
        relevantTripIds.push(tripId);
      }

      if (hasToStop) {
        break;
      }
    }

    const segments = relevantPolylines.map((encodedPolyline, index) => {
      const tripId = relevantTripIds[index];
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
  }, [tripDetails, searchParams, showFullRoute]);
  
  useEffect(() => {
    if (segments.length === 0) {
      return;
    }

    const allPoints: [number, number][] = segments.flatMap(segment => segment.positions);

    if (allPoints.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(allPoints);

    map.fitBounds(bounds, {
      padding: [50, 50],
      animate: true,
      duration: 0.8,
      maxZoom: 10,
    });
  }, [segments, map]);
  
 

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