// import React, { useEffect, useState } from "react";
// import { getData } from "../../api/api";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Marker, Tooltip, useMap } from "react-leaflet";
import { stationMarker } from "../MarkerIcons/MarkerIcons.ts";
import "./Tooltip.css";
import { createClusterIcon } from "../MarkerIcons/ClusterStationMarker.tsx";
import { useEffect, useState } from "react";
import type { Stop } from "../../types";
import { useStopsStore } from "../../store/StopsStore.tsx";


type MarkerClusterProps = {
  stops: Stop[]; 
}
export const MarkerClusters = ({ stops }: MarkerClusterProps) => {
  const map = useMap();
  const [zoomed, setZoomed] = useState(map.getZoom());
  const { getStopInfo } = useStopsStore();

  //handling zoom to show/hide tooltips
  useEffect(() => {
    const handleZoom = () => setZoomed(map.getZoom());
    map.on("zoomend", handleZoom);
    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map, zoomed]);


  const handleClick = async (id: string) => {
    try {
      await getStopInfo(id); 
    } catch (error) {
      console.error("Error with geting info", error);
    }
  };

  return (
    <MarkerClusterGroup
      maxClusterRadius={47}
      chunkedLoading
      iconCreateFunction={createClusterIcon}
      showCoverageOnHover={false}
    >
      {stops &&
        stops.map((stop) => (
          <Marker
            key={stop.stop_id}
            position={[stop.stop_lat, stop.stop_lng]}
            icon={stationMarker}
            eventHandlers={{
              click: () => {
                void handleClick(stop.stop_id);
              }
            }}
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
    </MarkerClusterGroup>
  );
};
