import { useRouteStore } from "../../store/RouteStore";
import css from './TripDetails.module.css';
import { 
  getUserJourneyStops, 
  removeDuplicateTransferStops,
  flattenTripStops,
  calculateUserTransfers
} from '../../utils/tripUtils';
import ArrowIcon from '../../assets/icons/arrow.svg?react';
import BackIcon from "../../assets/icons/icon-back.svg?react"
import { useMemo } from "react";
import type { Stop } from "../../types";
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

      return cleanedStops.slice(1);
    }, [details, searchParams]); 

    const fullRouteStops = useMemo(() => {
      if (!details?.trip_stop_times) {
        return [];
      }

      const allStops = flattenTripStops(details.trip_stop_times);
      const cleanedStops = removeDuplicateTransferStops(allStops);

      return cleanedStops.slice(1);
    }, [details]);

    const userTransferCount = useMemo(() => {
      if (!details?.trip_stop_times || !searchParams?.from_stop || !searchParams.to_stop) {
        return 0;
      }

      return calculateUserTransfers(
        details.trip_stop_times,
        searchParams.from_stop.stop_id,
        searchParams.to_stop.stop_id
      );
    }, [details, searchParams]);

    const transferStations = useMemo(() => {
  if (!details?.trip_stop_times || !searchParams?.from_stop || !searchParams.to_stop) {
    return [];
  }

  const userStops = getUserJourneyStops(
    details.trip_stop_times,
    searchParams.from_stop.stop_id,
    searchParams.to_stop.stop_id
  );

  const transfers: Array<{
    station: Stop;
    arrivalTime: string;
    departureTime: string;
    waitingMinutes: number;
    departureRoute: string;
    departurePlatform: string | null;
    departureTrack: string | null;
    tripHeadsign: string | null;
  }> = [];

  for (let i = 0; i < userStops.length - 1; i++) {
    const current = userStops[i];
    const next = userStops[i + 1];

    if (current.stop.stop_id === next.stop.stop_id && current.tripId !== next.tripId) {
      const arrivalTime = current.arrival_time;
      const departureTime = next.departure_time;

      const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
      const [depHours, depMinutes] = departureTime.split(':').map(Number);
      const waitingMinutes = (depHours * 60 + depMinutes) - (arrHours * 60 + arrMinutes);

      const nextTripStops = details.trip_stop_times[next.tripId];
      const departureStopDetails = nextTripStops?.find(
        stop => stop.stop.stop_id === next.stop.stop_id
      );

      const nextTripRoute = details.routes?.find((_, index) => {
        const tripIds = Object.keys(details.trip_stop_times);
        return tripIds[index] === next.tripId;
      }) || details.routes[0];

      transfers.push({
        station: current.stop,
        arrivalTime,
        departureTime,
        waitingMinutes,
        departureRoute: nextTripRoute,
        departurePlatform: departureStopDetails?.platform != null 
          ? String(departureStopDetails.platform) 
          : null,
        departureTrack: departureStopDetails?.track != null 
          ? String(departureStopDetails.track) 
          : null,
        tripHeadsign: details.trip_headsign,
      });
    }
  }

  return transfers;
}, [details, searchParams]);

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

            {!showFullRoute && userTransferCount > 0 && (
                <div className={css['transfers-section']}>
                    <p className={css['label']}>
                        Przesiadki ({userTransferCount})
                    </p>
                    <div className={css['transfers-list']}>
                        {transferStations.map((transfer, index) => (
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