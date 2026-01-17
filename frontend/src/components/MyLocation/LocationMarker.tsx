import { Marker, Tooltip } from "react-leaflet";
import "./LocationMarker.css";
import { meMarker } from "../MarkerIcons/MarkerIcons.ts";
import { LatLng } from "leaflet";

type LocationMarkerProps = { 
  position: LatLng | null;
}

export default function LocationMarker({ position }: LocationMarkerProps) {
  return position === null ? null : (
    <Marker position={position} icon={meMarker}>
      <Tooltip
        direction={"top"}
        offset={[0, -12]}
        className="me-tooltip"
        opacity={1}
      >
        Ty
      </Tooltip>
    </Marker>
  );
}
