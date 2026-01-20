import './LocateButton.css'
import LocateIcon from '../../assets/icons/locate-icon.svg'
import { useMap, useMapEvents } from 'react-leaflet'
import type { LatLng } from 'leaflet'

type LocateButtonProps = {
  setPosition: (position: LatLng) => void
}

export function LocateButton({ setPosition }: LocateButtonProps) {
  const map = useMap() 

  const handleClick = () => {
    map.locate({ setView: true, maxZoom: 12 })
  }

  useMapEvents({
  locationfound(e) {
    setPosition(e.latlng)
    map.flyTo(e.latlng, 12)
  },
})


  return (
    <button onClick={handleClick} className="locate-button">
      <img src={LocateIcon} alt="locate me" width={20} height={20} />
    </button>
  )
}
