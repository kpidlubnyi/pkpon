import './LocateButton.css'
import LocateIcon from '../../assets/locate-icon.svg'
import { useMap, useMapEvents } from 'react-leaflet'
import type { LatLng } from 'leaflet'
import type { Map as LeafletMap } from 'leaflet'

type LocateButtonProps = {
  setPosition: (position: LatLng) => void
}

export function LocateButton({ setPosition }: LocateButtonProps) {
  const map = useMap() as LeafletMap

  const handleClick = () => {
    map.locate({ setView: true, maxZoom: 12 })
  }

  useMapEvents({
  locationfound(e) {
    setPosition(e.latlng as LatLng)
    map.flyTo(e.latlng as LatLng, 12)
  },
})


  return (
    <button onClick={handleClick} className="locate-button">
      <img src={LocateIcon} alt="locate me" width={20} height={16} />
    </button>
  )
}
