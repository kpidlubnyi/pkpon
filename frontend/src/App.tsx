import { Map } from "./components/Map/Map.js";
import { useEffect } from "react";
import { UserProfileComp } from "./components/UserProfile/UserProfileComp.js";
import { useUserStore } from "./store/UserStore.js";
import { SearchPanel } from "./components/SearchPanel/SearchPanel.js";
import { useStopsStore } from "./store/StopsStore.js";
import { StopInfo } from "./components/StopInfo/StopInfo.js";
import {Toaster} from 'react-hot-toast';

function App() {
  const {getStops} = useStopsStore();
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
  
  return (
    
    <div style={{position: "relative"}}>
      <Map />
      <UserProfileComp />
      <SearchPanel />
      <StopInfo />
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
