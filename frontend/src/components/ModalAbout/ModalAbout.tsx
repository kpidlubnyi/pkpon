import css from './ModalAbout.module.css'
import CloseIcon from '../../assets/icons/close.svg?react'
import { useState } from 'react';

interface ModalProps  {
    closeModal: () => void;
}

export const ModalAbout = ({closeModal}: ModalProps) => {
    const [isClosing, setIsClosing] = useState(false);

const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            closeModal();
        }, 300); 
    };

  return (
    <div className={`${css['modal-backdrop']} ${isClosing ? css['closing'] : ''}`} onClick={handleClose}>
        <div className={`${css['modal-about']} ${isClosing ? css['closing'] : ''}`} onClick={(e) => e.stopPropagation()}>
              <button className={css['close-btn']} onClick={handleClose}>
                  <CloseIcon/>
            </button>
            
            <div className={css['hero']}>
                <h1>PKP ON</h1>
                <p className={css['pitch']}>
                    Jeden ekran. Cała Polska kolejowa.
                </p>
            </div>

            <p>
                PKP ON to kompleksowa aplikacja do planowania podróży kolejowych, 
                która łączy dane z całej sieci PKP w przystępny, interaktywny interfejs.
            </p>
        </div>
    </div>
)}
