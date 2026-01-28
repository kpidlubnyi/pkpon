import { useRouteStore } from '../../store/RouteStore';
import { normalizeTime } from '../../utils/FormatTime';
import css from './TripResults.module.css';
import { Loading } from '../Loading/Loading';
import type { MatchingTrip } from '../../types';
import dayjs from 'dayjs';

export const TripResults = () => {
  const { matchingTrips, selectedTrip, selectTrip, isSearching, searchParams } = useRouteStore();
  const currTime = dayjs();
  const date = currTime.format('DD.MM.YYYY');
  const time = currTime.format('HH:mm')
  
  if (!searchParams) return null;

  // Calculate duration in minutes between two times (HH:mm:ss format)
  const calculateDuration = (departure: string, arrival: string): number => {
    const [depHours, depMinutes] = departure.split(':').map(Number);
    const [arrHours, arrMinutes] = arrival.split(':').map(Number);
    
    const depTotalMinutes = depHours * 60 + depMinutes;
    const arrTotalMinutes = arrHours * 60 + arrMinutes;
    
    return arrTotalMinutes - depTotalMinutes;
  };

  //format duration from minutes to readable string
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  //transfer count fn
  const getTransferCount = (trip: MatchingTrip): number => {
    return Math.max(0, trip.legs - 1);
  };

  //format transfer text
  const formatTransfers = (count: number): string => {
    if (count === 0) return 'bezpośriedni';
    if (count === 1) return '1 przesiadka';
    return `${count} przesiadki`;
  };

  return (
    <div className={css['route-results-container']}>
      <div className={css['route-header']}>
        <div className={css['route-info']}>
          <h3 className={css['route-title']}>
            {searchParams.from_stop?.stop_name} – {searchParams.to_stop?.stop_name}
          </h3>
          <p>
            Od {time} {date}
          </p>
        </div>
      </div>

      <div className={css['routes-scroll']}>
        {isSearching && <Loading source="stops" />}
        
        {!isSearching && matchingTrips.length === 0 && (
          <div className={css['no-results']}>
            <p>Nie znaleziono połączeń</p>
            <p className={css['no-results-hint']}>Spróbuj zmienić kryteria wyszukiwania</p>
          </div>
        )}

        {!isSearching && matchingTrips.map((trip, index) => {
          const duration = calculateDuration(
            trip.departure_stop_time.departure_time,
            trip.arrival_stop_time.arrival_time
          );
          const transferCount = getTransferCount(trip);
          const departureNormalized = normalizeTime(trip.departure_stop_time.departure_time);
          const arrivalNormalized = normalizeTime(trip.arrival_stop_time.arrival_time);

          return (
            <div
              key={index}
              className={`${css['route-card']} ${selectedTrip === trip ? css['selected'] : ''}`}
              onClick={() => selectTrip(trip)}
            >
                <div className={css['time-info']}>
                  <span className={css['departure-time']}>
                  {departureNormalized.time} {departureNormalized.daysOffset && <small className={css['day-offset']}>{departureNormalized.daysOffset }</small>}
                  </span>
                  <div className={css['duration-info']}>
                    <span className={css['duration']}>{formatDuration(duration)}</span>
                    <span className={css['transfers']}>{formatTransfers(transferCount)}</span>
                  </div>
                  <span className={css['arrival-time']}>
                  {arrivalNormalized.time} {arrivalNormalized.daysOffset && <small className={css['day-offset']}>{arrivalNormalized.daysOffset}</small>}
                  </span>
                </div>
              </div>
          );
        })}
      </div>
    </div>
  );
};