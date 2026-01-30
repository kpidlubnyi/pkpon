import { useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import { tripMarker } from '../MarkerIcons/MarkerIcons';
import { useEffect, useState } from 'react';
import type { TripDetails } from '../../types';

interface TripStopMarkersProps {
  tripDetails: TripDetails | null;
  fromStopId: string;
  toStopId: string;
}

export const TripStopMarkers = ({ tripDetails, fromStopId, toStopId }: TripStopMarkersProps) => {
  const map = useMap();
  const [zoomed, setZoomed] = useState(map.getZoom());

  useEffect(() => {
    const handleZoom = () => setZoomed(map.getZoom());
    map.on("zoomend", handleZoom);
    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map]);

  const routeStops = useMemo(() => {
    if (!tripDetails?.trip_stop_times || !fromStopId || !toStopId) {
      return [];
    }

    const allStops: Array<{
      stop_id: string;
      stop_name: string;
      stop_lat: number;
      stop_lng: number;
    }> = [];

    const tripIds = Object.keys(tripDetails.trip_stop_times).sort();
    
    tripIds.forEach((tripId) => {
      const stopTimes = tripDetails.trip_stop_times[tripId];
      const sortedStopTimes = [...stopTimes].sort((a, b) => a.stop_sequence - b.stop_sequence);
      
      sortedStopTimes.forEach((st) => {
        allStops.push({
          stop_id: st.stop.stop_id,
          stop_name: st.stop.stop_name,
          stop_lat: st.stop.stop_lat,
          stop_lng: st.stop.stop_lng,
        });
      });
    });

    const fromIndex = allStops.findIndex((s) => s.stop_id === fromStopId);
    const toIndex = allStops.findIndex((s) => s.stop_id === toStopId);

    if (fromIndex === -1 || toIndex === -1) {
      return [];
    }

    const routeStops = allStops.slice(
      Math.min(fromIndex, toIndex),
      Math.max(fromIndex, toIndex) + 1
    );

    const seen = new Set<string>();
    const uniqueStops = routeStops.filter((stop) => {
      if (seen.has(stop.stop_id)) {
        return false;
      }
      seen.add(stop.stop_id);
      return true;
    });

    return uniqueStops;
  }, [tripDetails, fromStopId, toStopId]);

  if (routeStops.length === 0) {
    return null;
  }

  return (
    <>
      {routeStops.map((stop) => (
        <Marker
          key={stop.stop_id}
          position={[stop.stop_lat, stop.stop_lng]}
          icon={tripMarker}
        >
          <Tooltip
            key={zoomed}
            permanent={zoomed >= 12}
            direction="top"
            className="station-tooltip"
            offset={[1, -6]}
          >
            <strong>{stop.stop_name}</strong>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
};