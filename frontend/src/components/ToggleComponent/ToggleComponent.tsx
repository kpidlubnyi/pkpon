import css from './ToggleComponent.module.css';

interface ToggleComponentProps {
  active: 'login' | 'register';
  setActive: (value: 'login' | 'register') => void;
}

export const ToggleComponent = ({active, setActive}:ToggleComponentProps) => {

  return (
    <div className={css['auth-toggle-container']}>
      <div className={css['toggle-wrapper']}>
        <div
          className={css['toggle-highlight']}
          style={{
            transform: active === 'login' ? 'translateX(0%)' : 'translateX(100%)',
          }}
        />
        <button
          className={`${css['toggle-btn']} ${active === 'login' ? css['active'] : ''}`}
          onClick={() => setActive('login')}
        >
          Login
        </button>
        <button
          className={`${css['toggle-btn']} ${active === 'register' ? css['active'] : ''}`}
          onClick={() => setActive('register')}
        >
          Register
        </button>
      </div>
    </div>
  );
};
