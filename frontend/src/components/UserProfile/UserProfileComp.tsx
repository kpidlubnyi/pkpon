import css from "./UserProfileComp.module.css"
import UserIcon from "../../assets/icons/profile-button.svg?react"
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "../../store/UserStore";
import { AuthComponent } from "../AuthComponent/AuthComponent";
import { ProfileComponent } from "../ProfileComponent/ProfileComponent";
import { CSSTransition } from "react-transition-group";
import toast from "react-hot-toast";

type PanelMode = 'auth' | 'profile' | null;

export const UserProfileComp = () => {
    const [panelMode, setPanelMode] = useState<PanelMode>(null);
    const { user, logout } = useUserStore();

    const iconRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const authRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        setPanelMode(prev => prev ? null : user ? 'profile' : 'auth');
    }

   const handleLogout = () => {
       toast((t) => (
        <span className={css['confirm-toast']}>
            Czy na pewno chcesz się wylogować?
            <div className={css['toast-buttons']} >
                <button onClick={() => { 
                    toast.dismiss(t.id); 
                    void logout(); 
                    setPanelMode('auth'); 
                }}
                className={css['confirm-btn']}>
                    Tak
                </button>
                <button className={css['confirm-btn']} onClick={() => { toast.dismiss(t.id); setPanelMode('profile')}}>Nie</button>
            </div>
        </span>
       ), {
           duration: Infinity,
           position: 'top-center',
           style: {
               background: 'linear-gradient(to left, #8db1ccdd, #e2e9eadd)',      
               color: '#000000',              
               borderRadius: '26px',  
               padding: '10px',           
               boxShadow: 'var(--shadow)'
           }
    });
};

    useEffect(() => {
        const loginAndClose = () => {
            if (user && panelMode === 'auth') {
                setPanelMode(null);
            }

        }
        loginAndClose();
    }, [user, panelMode]);

   useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!panelMode) return;

            const clickedInsidePanel = panelRef.current?.contains(event.target as Node);
            const clickedOnIcon = iconRef.current?.contains(event.target as Node);

            if (!clickedInsidePanel && !clickedOnIcon) {
                setPanelMode(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [panelMode]);
    
    return (
        <div className={css['user-info']}>
            <div ref={iconRef} onClick={handleClick} className={css["user-icon"]}>
                <UserIcon width={60} height={60} className={css["icon-svg"]} />
            </div>
            <div ref={panelRef}>
                <CSSTransition
                    in={panelMode === 'auth'}
                    timeout={300}
                    classNames="user-panel"
                    unmountOnExit
                    nodeRef={authRef}
                >
                    <div ref={authRef}>
                        <AuthComponent />
                    </div>
                </CSSTransition>

                <CSSTransition
                    in={panelMode === 'profile' && !!user}
                    timeout={300}
                    classNames="user-panel"
                    unmountOnExit
                    nodeRef={profileRef}
                >
                    <div ref={profileRef}>
                        {user && <ProfileComponent user={user} onLogout={() => void handleLogout()} />}
                    </div>
                </CSSTransition>
            </div>
        </div>
    );
};
