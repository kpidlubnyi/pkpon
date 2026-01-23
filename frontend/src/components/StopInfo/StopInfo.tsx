import { useStopsStore } from "../../store/StopsStore"
import { formatTime } from "../../utils/FromatTime";
import css from './StopInfo.module.css';
import CalenderIcon from '../../assets/icons/calender.svg?react';
import ArrowIcon from '../../assets/icons/arrow.svg?react';
import IsoChrone from '../../assets/icons/isochrone.svg?react';
import { useState } from "react";

export const StopInfo = () => {
    const { selectedStop, selectedStopSchedule, getStopInfo } = useStopsStore();
    const [direction, setDirection] = useState<'arrivals' | 'departures'>('departures')

    if (!selectedStop && !selectedStopSchedule) return null

    const handleDirectionChange = async (newDirection: 'arrivals' | 'departures') => {
        setDirection(newDirection);
        if (selectedStop) {
            await getStopInfo(selectedStop.stop_id, { direction: newDirection });
        }
    };

    return <div className={css["stop-info"]}>
        <div className={css['stop-name-cont']}>
            <h2 className={css['stop-name']}>{selectedStop?.stop_name}</h2>
            <div className={css["isochrone-icon"]}>
                <IsoChrone width={30} height={30} />
            </div>
        </div>
        <div className={css['main-cont']}>
            <div className={css['settings']}>
                <div className={css["toggle-cont"]}>
                    <div className={css['toggle-wrapper']}>
                        <div
                            className={css['toggle-highlight']}
                            style={{
                                transform: direction === 'departures'
                                    ? 'translateX(0%)'
                                    : 'translateX(100%)',
                            }}
                        />
                            <button
                                className={`${css["toggle-btn"]} ${direction === "departures" ? css["active"] : ''}`}
                                onClick={() => void handleDirectionChange('departures')}>
                                Odjazdy
                            </button>
                            <button
                                className={`${css["toggle-btn"]} ${direction === "arrivals" ? css["active"] : ''}`}
                                onClick={() => void handleDirectionChange('arrivals')}>
                                Przyjazdy
                            </button>
                        
                    </div>
                </div>
                <div className={css['calender']}>
                    <CalenderIcon width={30} height={30} />
                </div>
            </div>
            <div className={css['scroll-cont']}>
                <ul className={css['schedule-list']}>
                    {selectedStopSchedule?.schedule.map((item, i) => (
                        <li key={i} className={css['schedule-item']}>
                            <div className={css['time']}>{formatTime(direction === 'arrivals' ? item.arrival_time : item.departure_time)}</div>
                            <ArrowIcon width={20} height={20} />
                            <div className={css["trip-to"]}>{item.trip_headsign}</div>
                        </li>
                    ))}
                </ul>
             
            </div>
        </div>
    </div>
};
