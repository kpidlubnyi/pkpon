import LogoIcon from '../../assets/icons/logo.svg?react';
import TrainIcon from '../../assets/icons/train-icon.svg?react';
import StopIcon from '../../assets/icons/stop-icon.svg?react';
import css from './SearchPanel.module.css'
import { useState } from "react";
import { Search } from './Autocomplete/Autocomplete';

export const SearchPanel = () => {
    const [active, setActive] = useState<'left' | 'right'>('right');

    return (
        <div className={css["search-panel"]}>
            <div className={css['logo-cont']}>
                <LogoIcon className={css["logo"]} width={28} height={28} />
            </div>
            <Search/>
            <div className={css["toggle-cont"]}>
                <div className={css['auth-toggle-container']}>
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
                            onClick={() => setActive('left')}
                        >
                            <TrainIcon width={32} height={32} className={`${css["toggle-icon"]} ${active === "left" ? css["active"] : ''}`} />
                        </button>
                        <button
                            className={css['toggle-btn']}
                            onClick={() => setActive('right')}
                        >
                            <StopIcon width={32} height={32} className={`${css["toggle-icon"]} ${active === "right" ? css["active"] : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
