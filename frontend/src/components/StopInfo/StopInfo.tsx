import { useStopsStore } from "../../store/StopsStore"
import { formatTime } from "../../utils/FormatTime";
import css from './StopInfo.module.css';
import CalenderIcon from '../../assets/icons/calender.svg?react';
import ArrowIcon from '../../assets/icons/arrow.svg?react';
import IsoChrone from '../../assets/icons/isochrone.svg?react';
import { useRef, useState } from "react";
import { DatePickerComponent, type DatePickerRef } from "../DatePicker/DatePicker";
import { parseDateTimeString } from "../../utils/DateTimeParser";

export const StopInfo = () => {
    const datePickerRef = useRef<DatePickerRef>(null);
    const { selectedStop, selectedStopSchedule, getStopInfo } = useStopsStore();
    const [direction, setDirection] = useState<'arrivals' | 'departures'>('departures');
    const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null);

    if (!selectedStop && !selectedStopSchedule) return null

    const handleDirectionChange = (newDirection: 'arrivals' | 'departures') => {
        setDirection(newDirection);
        if (selectedStop) {
            const { date, time } = parseDateTimeString(selectedDateTime);
            
            void getStopInfo(selectedStop.stop_id, {
                direction: newDirection,
                date,
                time,
            });
        }
    };

    const handleDateTimeChange = (dateTime: string | null) => {
        setSelectedDateTime(dateTime);
        if (selectedStop) {
            const { date, time } = parseDateTimeString(dateTime);
            
            void getStopInfo(selectedStop.stop_id, {
                direction,
                date,
                time,
            });
        }
    };

    const handleCalendarClick = () => {
        datePickerRef.current?.openPicker();
    };

    return (
        <div className={css["stop-info"]}>
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
                                onClick={() => handleDirectionChange('departures')}>
                                Odjazdy
                            </button>
                            <button
                                className={`${css["toggle-btn"]} ${direction === "arrivals" ? css["active"] : ''}`}
                                onClick={() => handleDirectionChange('arrivals')}>
                                Przyjazdy
                            </button>
                        </div>
                        <div style={{ position: "absolute", bottom: 30, left: 320 }}>
                            <DatePickerComponent
                                ref={datePickerRef}
                                onDateTimeChange={handleDateTimeChange}
                            />
                        </div>
                    </div>
                    <div 
                        className={`${css['calender']} ${selectedDateTime ? css['active'] : ''}`} 
                        onClick={handleCalendarClick}
                    >
                        <CalenderIcon width={30} height={30} />
                    </div>
                </div>
                <div className={css['scroll-cont']}>
                    {selectedStopSchedule && selectedStopSchedule?.schedule.length < 1 ? (
                        <h2 className={css['no-train']}>
                            W tym momencie nie ma żadnych pociągów, spróbuj zmienić datę albo czas
                        </h2>
                    ) : (
                        <ul className={css['schedule-list']}>
                            {selectedStopSchedule?.schedule.map((item, i) => (
                                <li key={i} className={css['schedule-item']}>
                                    <div className={css['time']}>
                                        {formatTime(direction === 'arrivals' ? item.arrival_time : item.departure_time)}
                                    </div>
                                    <ArrowIcon width={20} height={20} />
                                    <div className={css["trip-to"]}>{item.trip_headsign}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};