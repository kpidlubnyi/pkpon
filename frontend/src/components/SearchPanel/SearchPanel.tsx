import LogoIcon from '../../assets/icons/logo.svg?react';
import TrainIcon from '../../assets/icons/train-icon.svg?react';
import StopIcon from '../../assets/icons/stop-icon.svg?react';
import css from './SearchPanel.module.css'
import { useState } from "react";
import { Search } from './Autocomplete/Autocomplete';
import { RouteSearch } from '../RouteSearch/RouteSearch';
import { useRouteStore } from '../../store/RouteStore';
import dayjs from 'dayjs';
import type { Stop } from '../../types';
import { useStopsStore } from '../../store/StopsStore';
import { ModalAbout } from '../ModalAbout/ModalAbout';

export const SearchPanel = () => {
    const [active, setActive] = useState<'left' | 'right'>('right');
    const { searchTrips, clearTrips } = useRouteStore();
    const { clearSelectedSchedule } = useStopsStore();
    const [showModal, setShowModal] = useState(false);

    const handleTripSearch = (from: Stop, to: Stop, date?: string, time?: string) => {
        const currTime = dayjs();

        void searchTrips({
            from_stop: from.stop_id,
            to_stop: to.stop_id,
            date: date ?? currTime.format('YYYY-MM-DD'),
            time: time ?? currTime.format('HH:mm:ss'),
        },
            from,
            to,
        );
    };

    const handleToggle = (side: 'left' | 'right') => {
        setActive(side);

        if (side === 'left') {
            clearSelectedSchedule();
        }

        if (side === 'right') {
            clearTrips();
        }
    };

    const closeModal = () => {
        setShowModal(false)
    };

    return (
        <div className={css["search-panel"]}>
            <div className={css['logo-cont']} onClick={() => setShowModal(true)}>
                <LogoIcon className={css["logo"]} width={28} height={28} />
            </div>
            <div className={css["toggle-cont"]}>
                <div className={css['toggle-wrapper']}>
                    <div
                        className={css['toggle-highlight']}
                        style={{
                            transform: active === 'left'
                                ? 'translateX(0%)'
                                : 'translateX(100%)',
                        }}
                    />
                    <button
                        className={css['toggle-btn']}
                        onClick={() => handleToggle('left')}
                    >
                        <TrainIcon width={32} height={32} className={`${css["toggle-icon"]} ${active === "left" ? css["active"] : ''}`} />
                    </button>
                    <button
                        className={css['toggle-btn']}
                        onClick={() => handleToggle('right')}
                    >
                        <StopIcon width={32} height={32} className={`${css["toggle-icon"]} ${active === "right" ? css["active"] : ''}`} />
                    </button>
                </div>
            </div>

            {active === 'left' ? (
                <RouteSearch onRouteSearch={handleTripSearch}/>
            ) : (
                <Search />
            )}
            {showModal && <ModalAbout closeModal={closeModal}/>}
        </div>
    );
}
