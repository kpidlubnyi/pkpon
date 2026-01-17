declare module 'leaflet.markercluster' {
  import { DivIcon } from 'leaflet'

  export interface MarkerCluster {
    getChildCount: () => number
  }

  import { Component } from 'react'
  export interface MarkerClusterGroupProps {
    maxClusterRadius?: number
    chunkedLoading?: boolean
    iconCreateFunction?: (cluster: MarkerCluster) => DivIcon
    showCoverageOnHover?: boolean
    children?: React.ReactNode
  }

  export class MarkerClusterGroup extends Component<MarkerClusterGroupProps> {}
}
