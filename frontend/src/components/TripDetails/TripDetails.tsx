import { useRouteStore } from "../../store/RouteStore";
import css from './TripDetails.module.css';
import { 
  getUserJourneyStops, 
  removeDuplicateTransferStops,
  flattenTripStops,
  extractTransfers
} from '../../utils/TripUtils';
import ArrowIcon from '../../assets/icons/arrow.svg?react';
import BackIcon from "../../assets/icons/icon-back.svg?react"
import { useMemo } from "react";
import { normalizeTime } from "../../utils/FormatTime";

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

      const userStops = getUserJourneyStops(
        details.trip_stop_times,
        fromStopId,
        toStopId
      );

      const cleanedStops = removeDuplicateTransferStops(userStops);

      return cleanedStops.slice(1); // Пропускаємо першу зупинку
    }, [details, searchParams]); 

    const fullRouteStops = useMemo(() => {
      if (!details?.trip_stop_times) {
        return [];
      }

      const allStops = flattenTripStops(details.trip_stop_times);
      const cleanedStops = removeDuplicateTransferStops(allStops);

      return cleanedStops.slice(1); 
    }, [details]);


    const userTransferStations = useMemo(() => {
      if (!details?.trip_stop_times || !searchParams?.from_stop || !searchParams.to_stop) {
        return [];
      }

      const userStops = getUserJourneyStops(
        details.trip_stop_times,
        searchParams.from_stop.stop_id,
        searchParams.to_stop.stop_id
      );

      return extractTransfers(userStops, details);
    }, [details, searchParams]);

    const fullRouteTransferStations = useMemo(() => {
      if (!details?.trip_stop_times) {
        return [];
      }

      const allStops = flattenTripStops(details.trip_stop_times);
      return extractTransfers(allStops, details);
    }, [details]);

    if (!details || !searchParams) return null;

    const firstSegmentStops = Object.values(details.trip_stop_times)[0];
    
    const departureStop = showFullRoute 
        ? firstSegmentStops?.[0] 
        : firstSegmentStops?.find(
            stop => stop.stop.stop_id === searchParams.from_stop?.stop_id
        ) || firstSegmentStops?.[0]; 
    
    const handleBackToList = () => {
        if (showFullRoute) {
            setShowFullRoute(false);
            return;
        }

        selectTrip(null);
    };

    const handleToggleFullRoute = () => {
        setShowFullRoute(true);
    };
    
    const displayStops = showFullRoute ? fullRouteStops : routeStops;
    const displayTransfers = showFullRoute ? fullRouteTransferStations : userTransferStations;
    const displayTransferCount = displayTransfers.length;
   
    return (
        <div className={css['trip-details-container']}>
            <div className={css['up-panel']}>
                <button className={css['back-btn']} onClick={handleBackToList}>
                    <BackIcon width={20} height={20} />
                </button>
                {!showFullRoute && (
                    <div className={css['header-section']} onClick={handleToggleFullRoute}>
                        <p className={css['label']}>Kurs</p>
                        <h2 className={css['route-name']}>{details.trip_route_name}</h2>
                    </div>
                )}
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
                            {displayStops.map((stop, index) => {
                                const time = normalizeTime(stop.arrival_time.slice(0, 5));
                                const isLast = index === displayStops.length - 1;
                                
                                if (isLast) {
                                    return (
                                        <li key={`${stop.tripId}-${index}`} className={css['time-platform']}>
                                            <div className={css['stop-info']}>
                                                <span className={css['departure-time']}>
                                                    {time.time}
                                                </span>
                                                <span className={css['station-name']}>
                                                    {stop.stop.stop_name}
                                                </span>
                                            </div>
                                            <div className={css['platform-info']}>
                                                przyjazd na:
                                                <span className={css['badged']}>
                                                    peron {stop.platform || '-'}
                                                </span>
                                                <span className={css['badged']}>
                                                    tor {stop.track || '-'}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                }
                                
                                return (
                                    <li key={`${stop.tripId}-${index}`} className={css['stop-item']}>
                                        <span className={css['stop-time']}>
                                            {time.time}
                                        </span>
                                        <span className={css['stop-name']}>
                                            {stop.stop.stop_name}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {displayTransferCount > 0 && (
                <div className={css['transfers-section']}>
                    <p className={css['label']}>
                        Przesiadki ({displayTransferCount})
                    </p>
                    <div className={css['transfers-list']}>
                        {displayTransfers.map((transfer, index) => (
                            <div key={index} className={css['transfer-item']}>
                                <div className={css['transfer-header']}>
                                    <span className={css['transfer-station']}>
                                        {transfer.station.stop_name}
                                        <div className={css['transfer-times']}>
                                            <span>{transfer.arrivalTime.slice(0, 5)} — </span>
                                            <span>{transfer.departureTime.slice(0, 5)}</span>
                                        </div>
                                    </span>
                                    <div className={css['transfer-platform-info']}>
                                        odjazd z:
                                        <span className={css['badged']}>
                                            peron {transfer.departurePlatform || '-'}
                                        </span>
                                        <span className={css['badged']}>
                                            tor {transfer.departureTrack || '-'}
                                        </span>
                                    </div>
                                </div>
          
                                <div className={css['transfer-route-info']}>
                                    <div className={css['carrier-badge']}>
                                        {transfer.departureRoute}
                                    </div>
                                    <ArrowIcon className={css['arrow-icon']} />
                                    <span className={css['transfer-destination']}>
                                        {transfer.tripHeadsign}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};