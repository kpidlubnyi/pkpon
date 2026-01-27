import { Map } from "./components/Map/Map.js";
import { useEffect } from "react";
import { UserProfileComp } from "./components/UserProfile/UserProfileComp.js";
import { useUserStore } from "./store/UserStore.js";
import { SearchPanel } from "./components/SearchPanel/SearchPanel.js";
import { useStopsStore } from "./store/StopsStore.js";
import { StopInfo } from "./components/StopInfo/StopInfo.js";
import {Toaster} from 'react-hot-toast';
import { CSSTransition } from "react-transition-group";
import { TripResults } from "./components/TripResults/TripResults.js";
import { useRouteStore } from "./store/RouteStore.js";

function App() {
  const { getStops, selectedStop, selectedStopSchedule } = useStopsStore();
  const { selectedTrip, matchingTrips } = useRouteStore();
  const {checkAuth} = useUserStore();

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

   useEffect(() => {
      const fetchStops = async () => {
        await getStops();
     };
     
      void fetchStops();
    }, [getStops]);
  
  const isStopInfoVisible = !!(selectedStop || selectedStopSchedule);
  const isTripsVisible = !!(selectedTrip || matchingTrips)
  
  return (
    
    <div style={{ position: "relative" }}>
      <Map />
      <UserProfileComp />
      <SearchPanel />
      
      {selectedTrip ?
        <CSSTransition
          in={isTripsVisible}
          timeout={200}
          classNames="route-results-container"
          unmountOnExit
        >
          <TripResults />
        </CSSTransition>
        :
        <CSSTransition
          in={isStopInfoVisible}
          timeout={100}
          classNames="stop-info"
          unmountOnExit
        >
          <StopInfo />
        </CSSTransition>}

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'var(--font-family)',
            fontSize: '14px',
            borderRadius: '26px',
            padding: '12px 20px',
            boxShadow: 'var(--shadow)',
          },
          success: {
            style: {
              background: '#55ff96'
            },
            iconTheme: {
              primary: 'var(--primary-blue)',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              background: '#ff8383',
              color: '#ffffff',
            },
            iconTheme: {
              primary: '#ff5656',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
