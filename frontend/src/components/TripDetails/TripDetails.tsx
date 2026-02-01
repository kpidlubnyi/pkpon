import { useRouteStore } from "../../store/RouteStore";
import css from './TripDetails.module.css';
import ArrowIcon from '../../assets/icons/arrow.svg?react';
import BackIcon from "../../assets/icons/icon-back.svg?react"
import { useMemo } from "react";
import type { Stop } from "../../types";

export const TripDetails = () => {
    const { tripDetails: details, searchParams, selectTrip, showFullRoute, setShowFullRoute } = useRouteStore();
    
   
    const totalDist = details?.trip_stop_times
        ? Object.values(details.trip_stop_times).reduce(
            (sum, stops) => sum + (stops[stops.length - 1]?.fare_dist_m ?? 0),
            0
        )
        : 0;

    const totalKm = (totalDist / 1000).toFixed(1);
    
    const routeStops = useMemo(() => {
      if (!details?.trip_stop_times || !searchParams?.from_stop || !searchParams.to_stop) {
        return [];
      }

      const fromStopId = searchParams.from_stop.stop_id;
      const toStopId = searchParams.to_stop.stop_id;

      const allStops: Array<{
        stop: Stop;
        arrival_time: string;
        departure_time: string;
        tripId: string;
      }> = [];

      Object.entries(details.trip_stop_times).forEach(([tripId, stops]) => {
        stops.forEach((stop) => {
          allStops.push({
            stop: stop.stop,
            arrival_time: stop.arrival_time,
            departure_time: stop.departure_time,
            tripId,
          });
        });
      });

      const fromIndex = allStops.findIndex(s => s.stop.stop_id === fromStopId);
      const toIndex = allStops.findIndex(s => s.stop.stop_id === toStopId);

      if (fromIndex === -1 || toIndex === -1) {
        return [];
      }

      return allStops.slice(fromIndex + 1, toIndex + 1);
    }, [details, searchParams]); 

    const fullRouteStops = useMemo(() => {
      if (!details?.trip_stop_times) {
        return [];
      }

      const allStops: Array<{
        stop: Stop;
        arrival_time: string;
        departure_time: string;
        tripId: string;
      }> = [];

      Object.entries(details.trip_stop_times).forEach(([tripId, stops]) => {
        stops.forEach((stop) => {
          allStops.push({
            stop: stop.stop,
            arrival_time: stop.arrival_time,
            departure_time: stop.departure_time,
            tripId,
          });
        });
      });

      return allStops.slice(1);
    }, [details]);

    if (!details || !searchParams) return null;

    const firstSegmentStops = Object.values(details.trip_stop_times)[0];
    
    const departureStop = showFullRoute 
        ? firstSegmentStops?.[0] 
        : firstSegmentStops?.find(
            stop => stop.stop.stop_id === searchParams.from_stop?.stop_id
        ) || firstSegmentStops?.[0]; 
    
    const handleBackToList = async () => {
        if (showFullRoute) {
            setShowFullRoute(false);
            return;
        }

        await selectTrip(null);
    };

    const handleToggleFullRoute = () => {
        setShowFullRoute(true);
    };
    
    const displayStops = showFullRoute ? fullRouteStops : routeStops;
   
    return (
        <div className={css['trip-details-container']}>
            <div className={css['up-panel']}>
                <button className={css['back-btn']} onClick={() => void handleBackToList()}>
                    <BackIcon width={20} height={20} />
                </button>
                <div className={css['header-section']} >
                    <p className={css['label']}>Kurs</p>
                    <h2 className={css['route-name']} onClick={handleToggleFullRoute}>{details.trip_route_name}</h2>
                </div>
            </div>

            <div className={css['stops-section']}>
                <div className={css['distance-section']}>
                    <p className={css['label']}>Trasa</p>
                    <p className={css['distance-value']}>{totalKm} km</p>
                </div>
                {departureStop && (
                    <div className={css['stops']}>
                        <div className={css['time-platform']}>
                            <div className={css['dep-stop']}>
                                <h2 className={css['departure-time']}>
                                    {departureStop.departure_time.slice(0, 5)}
                                </h2>
                                <p className={css['station-name']}>
                                    {departureStop.stop.stop_name}
                                </p>
                            </div>
                          
                            <span className={css['platform-info']}>
                                odjazd z:
                                <span className={css['badged']}> peron {departureStop.platform || '-'}</span>
                                <span className={css['badged']}> tor {departureStop.track || '-'}</span>
                            </span>
                        </div>

                        <div className={css['route-info']}>
                            <div className={css['carrier-badge']}>
                                {details.routes[0]}
                            </div>
                            <ArrowIcon className={css['arrow-icon']} />
                            <span className={css['final-destination']}>
                                {details.trip_headsign}
                            </span>
                        </div>

                        <div className={css['train-number']}>
                            {details.trip_short_name || details.plk_train_number[0]}
                        </div>
                        <ul className={css['stops-list']}>
                            {displayStops.map((stop, index) => (
                                <li key={`${stop.tripId}-${index}`} className={css['stop-item']}>
                                    <span className={css['stop-time']}>
                                        {stop.arrival_time.slice(0, 5)}
                                    </span>
                                    <span className={css['stop-name']}>
                                        {stop.stop.stop_name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {details.legs > 1 && (
                <div className={css['transfers-section']}>
                    <p className={css['label']}>Przesiadki</p>
                    <div className={css['transfers-list']}>
                        {/* TODO: список пересадок */}
                    </div>
                </div>
            )}
        </div>
    );
};