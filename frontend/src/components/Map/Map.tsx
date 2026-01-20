import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LocationMarker from "../MyLocation/LocationMarker.tsx";
import { MarkerClusters } from "../MarkerClusters/MarkerClusters.tsx";
import {LocateButton} from "../LocateButton/LocateButton.tsx";
import { useState } from "react";
import type { LatLng } from "leaflet";
import { useStopsStore } from "../../store/StationStore.tsx";
import { MapController } from "../MapController/MapController.tsx";


export const Map = () => {
  const [position, setPosition] = useState<LatLng | null>(null);
  const {stops} = useStopsStore()



  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        zoomControl={false}
        scrollWheelZoom
        center={[52.049, 19.204]}
        zoom={6.4}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a> &amp; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>'
          url="https://api.maptiler.com/maps/dataviz-light/256/{z}/{x}/{y}.png?key=Wds0noUluChrbsvv6WDv"
        />

        <LocateButton setPosition={setPosition} />
        {position && <LocationMarker position={position} />}
        {/* 
        {!hasRoute && <MarkerClusters />}
        {hasRoute && <RouteLayer />} */}
        <MapController/>
        <MarkerClusters stops={stops} />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
};
