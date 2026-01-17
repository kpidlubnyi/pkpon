import L from "leaflet";

export const stationMarker = L.divIcon({
  html: `
    <svg width="20" height="20" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill="#4681FF" stroke="#284CC3" stroke-width="2"/>
    </svg>
  `,
  className: "station-marker",
  iconSize: [32, 32],
  iconAnchor: [8, 8],
});


export const meMarker = L.divIcon({
   html: `
    <svg width="17" height="17" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill="#2DF07B" stroke="#284CC3" stroke-width="2"/>
    </svg>
  `,
  className: "station-marker",
  iconSize: [32, 32],
  iconAnchor: [8, 8],
})