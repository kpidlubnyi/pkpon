import { useRouteStore } from '../../store/RouteStore';
import { normalizeTime } from '../../utils/FormatTime';
import css from './TripResults.module.css';
import { Loading } from '../Loading/Loading';
import type { MatchingTrip } from '../../types';
import dayjs from 'dayjs';
import { TripDetails } from '../TripDetails/TripDetails';
import { calculateUserTransfers } from '../../utils/tripUtils';
import CloseIcon from '../../assets/icons/close.svg?react';

export const TripResults = () => {
  const { matchingTrips, selectTrip, isSearching, tripDetails, searchParams, clearTrips } =
    useRouteStore();
  const currTime = dayjs();
  const date = currTime.format('DD.MM.YYYY');
  const time = currTime.format('HH:mm');

  if (!searchParams) return null;

  const calculateDuration = (
    departure: string,
    arrival: string
  ): number => {
    const [depHours, depMinutes] = departure.split(':').map(Number);
    const [arrHours, arrMinutes] = arrival.split(':').map(Number);

    const depTotalMinutes = depHours * 60 + depMinutes;
    const arrTotalMinutes = arrHours * 60 + arrMinutes;

    return arrTotalMinutes - depTotalMinutes;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}g`;
    return `${hours}g ${mins}min`;
  };

  const getTransferCount = (trip: MatchingTrip): number => {
    if (trip.details?.trip_stop_times && searchParams.from_stop && searchParams.to_stop) {
      return calculateUserTransfers(
        trip.details.trip_stop_times,
        searchParams.from_stop.stop_id,
        searchParams.to_stop.stop_id
      );
    }
    return Math.max(0, trip.legs - 1);
  };

  const formatTransfers = (count: number): string => {
    if (count === 0) return 'bezpośriedni';
    if (count === 1) return '1 przesiadka';
    return `${count} przesiadki`;
  };

  return (
    <div className={css['route-results-container']}>
      <CloseIcon className={css['close']} onClick={clearTrips} width={24} height={24} />
      <div className={css['route-header']}>
        <div className={css['route-info']}>
          <h3 className={css['route-title']}>
            {searchParams.from_stop?.stop_name} –
            {searchParams.to_stop?.stop_name}
          </h3>
          <p>
            Od {time} {date}
          </p>
        </div>
      </div>
      {tripDetails ? (
        <TripDetails />
      ) : (
        <div className={css['routes-scroll']}>
          {isSearching && <Loading source="stops" />}
          {!isSearching && matchingTrips.length === 0 && (
            <div className={css['no-results']}>
              <p>Nie znaleziono połączeń</p>
              <p className={css['no-results-hint']}>
                Spróbuj zmienić kryteria wyszukiwania
              </p>
            </div>
          )}

          {!isSearching &&
            matchingTrips.map((trip, index) => {
              const duration = calculateDuration(
                trip.departure_stop_time.departure_time,
                trip.arrival_stop_time.arrival_time
              );
              const transferCount = getTransferCount(trip);
              const departureNormalized = normalizeTime(
                trip.departure_stop_time.departure_time
              );
              const arrivalNormalized = normalizeTime(
                trip.arrival_stop_time.arrival_time
              );

              return (
                <div
                  key={index}
                  className={css['route-card']}
                  onClick={() => selectTrip(trip)}
                >
                  <div className={css['time-info']}>
                    <span className={css['departure-time']}>
                      {departureNormalized.time}
                      {departureNormalized.daysOffset && (
                        <small className={css['day-offset']}>
                          {departureNormalized.daysOffset}
                        </small>
                      )}
                    </span>
                    <div className={css['duration-info']}>
                      <span className={css['duration']}>
                        {formatDuration(duration)}
                      </span>
                      <span className={css['transfers']}>
                        {formatTransfers(transferCount)}
                      </span>
                    </div>
                    <span className={css['arrival-time']}>
                      {arrivalNormalized.time}
                      {arrivalNormalized.daysOffset && (
                        <small className={css['day-offset']}>
                          {arrivalNormalized.daysOffset}
                        </small>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};