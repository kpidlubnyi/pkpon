import { Map } from "./components/Map/Map.js";
import { useEffect, useState } from "react";
import { UserProfileComp } from "./components/UserProfile/UserProfileComp.js";
import { useUserStore } from "./store/UserStore.js";
import { SearchPanel } from "./components/SearchPanel/SearchPanel.js";
import { useStopsStore } from "./store/StopsStore.js";
import type { Schedule } from "./types.js";
import { StopInfo } from "./components/StopInfo/StopInfo.js";

function App() {
  const {getStops} = useStopsStore();
  const {checkAuth} = useUserStore();
  const [schedule, setSchedule] = useState<Schedule>();

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
      <StopInfo schedule={schedule} />
    </div>
  );
}

export default App;
