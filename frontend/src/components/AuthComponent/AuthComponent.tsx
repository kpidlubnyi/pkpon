import { useState } from 'react';
import css from './AuthComponent.module.css';
import { ToggleComponent } from '../ToggleComponent/ToggleComponent';
import { LoginComponent } from '../LoginComponent/LoginComponent';
import { RegisterComponent } from '../RegisterComponent/RegisterComponent';

export const AuthComponent = () => {
  const [active, setActive] = useState<'login' | 'register'>('login');

  return (
    <div className={css['auth-container']}>
      <ToggleComponent active={active} setActive={setActive} />
      <div className={css['form-cont']}>
          {active === 'login' ? <div
              className={`${ active === 'login' ? css['active'] : css['hidden']
              }`}
            >
              <LoginComponent />
            </div>
              : <div
              className={`${ active === 'register' ? css['active'] : css['hidden']
              }`}
            >
              <RegisterComponent />
            </div>}
      </div>
    </div>
  );
};
