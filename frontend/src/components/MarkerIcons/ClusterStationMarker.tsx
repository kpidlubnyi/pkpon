import L from "leaflet";
import type { MarkerCluster } from "leaflet.markercluster";

export const createClusterIcon = (cluster: MarkerCluster
) => {
  const count = cluster.getChildCount(); 

  const size = count < 10 ? 25 : count < 50 ? 32 : count < 100 ? 39 : 45; 

  const html = ` <div style="
      background: #4681FF;          /* fill як у маркера */
      border: 2px solid #284CC3;    /* stroke як у маркера */
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 2px 3px 2px rgba(0, 0, 0, 0.45);
      font-weight: bold;
      font-size: ${size / 2}px;
    ">
      ${count}
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
  });
};
