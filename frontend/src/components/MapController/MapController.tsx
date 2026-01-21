import { useStopsStore } from '../../store/StopsStore'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function MapController() {
  const map = useMap()
  const selectedStop = useStopsStore(state => state.selectedStop)

  useEffect(() => {
    if (!selectedStop) return

    map.flyTo(
      [selectedStop.stop_lat, selectedStop.stop_lng],
      14
    )
  }, [selectedStop, map])

  return null
}
