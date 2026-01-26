import LoadingIcon from '../../assets/spinner.svg?react'
import { useStopsStore } from '../../store/StopsStore'
import { useUserStore } from '../../store/UserStore'
import css from './Loading.module.css'

interface LoadingProps {
    source: 'stops' | 'user'
};

export const Loading = ({ source }: LoadingProps) => {
    const isStopsLoading = useStopsStore(state => state.isStopsLoading);
    const isUserLoading = useUserStore(state => state.isUserLoading);

    const isLoading = source === 'stops' ? isStopsLoading : isUserLoading;

    if (!isLoading) return null
    
  return (
      <div className={css['spiner-cont']}>
          <LoadingIcon className={css['loading-icon']} width={20} height={20}/>
    </div>
  )
}
