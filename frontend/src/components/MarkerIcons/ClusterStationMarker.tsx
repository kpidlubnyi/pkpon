import L from "leaflet";
import type { MarkerCluster } from "leaflet.markercluster";
import './Cluster.css';


export const createClusterIcon = (cluster: MarkerCluster
) => {
  const count = cluster.getChildCount(); 

  
  
  const getStyle = (count: number) => {
    return count < 10 ? 'cluster--sm' : count < 50 ? 'cluster--md' : count < 100 ? 'cluster--lg' : 'cluster--xl';
  };
  
  const clusterStyle = getStyle(count);
  const size = count < 10 ? 25 : count < 50 ? 32 : count < 100 ? 39 : 45; 

  const html = ` <div class='cluster ${clusterStyle}'>
      ${count}
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
  });
};
