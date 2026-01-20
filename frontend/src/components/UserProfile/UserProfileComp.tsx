import css from "./UserProfileComp.module.css"
import UserIcon from "../../assets/icons/profile-button.svg?react"
import { useEffect, useState } from "react";
import { useUserStore } from "../../store/UserStore";
import { AuthComponent } from "../AuthComponent/AuthComponent";
import { ProfileComponent } from "../ProfileComponent/ProfileComponent";

type PanelMode = 'auth' | 'profile' | null;

export const UserProfileComp = () => {
    const [panelMode, setPanelMode] = useState<PanelMode>(null);
    const { user, logout } = useUserStore();

    const handleClick = () => {
        setPanelMode(prev => prev ? null : user ? 'profile' : 'auth');
    }

    const handleLogout = async () => {
        await logout();
        setPanelMode('auth');
    };

    useEffect(() => {
        const loginAndClose = () => {
            if(user && panelMode === 'auth') {
                setPanelMode(null);
            }

        }
        loginAndClose();
    }, [user, panelMode]);


    return (
        <div className={css['user-info']}>
            <div onClick={handleClick} className={css["user-icon"]}>
                <UserIcon width={60} height={60} className={css["icon-svg"]} />
            </div>
            {panelMode === 'auth' && <AuthComponent />}
            {panelMode === 'profile' &&  user && (<ProfileComponent user={user} onLogout={() => void handleLogout()} />)}
        </div>
    );
};
