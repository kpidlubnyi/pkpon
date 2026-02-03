import type { User } from '../../types';
import css from './ProfileComponent.module.css';
import LogoutIcon from '../../assets/icons/logout.svg?react';

interface ProfileComponentProps {
    user: User;
    onLogout: () => void;
}

export const ProfileComponent = ({ user, onLogout }: ProfileComponentProps) => {

    return (
        <div className={css['profile-container']}>
            <div className={css['profile-content']}>
                <div>
                    <h2 className={css['profile-title']}>Username</h2>
                    <p className={css['username-content']}>{user.username}</p>
                </div>
                <div>
                    <h2 className={css['profile-title']}>Email</h2>
                    <p className={css['username-content']}>{user.email}</p>
                </div>
                <div className={css['logout']} onClick={onLogout}>
                    <button className={css['logout-btn']}>
                        <LogoutIcon className={css['logout-icon']} />
                    </button>
                </div>
            </div>
        </div>
    );
}
