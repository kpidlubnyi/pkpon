import { Map } from "./components/Map/Map.js";
import { getStops } from "../src/services/mapService.js";
import { useEffect } from "react";
import { UserProfileComp } from "./components/UserProfile/UserProfileComp.js";
import { useUserStore } from "./store/UserStore.js";
import { useStopsStore } from "./store/StationStore.js";
import { SearchPanel } from "./components/SearchPanel/SearchPanel.js";

function App() {
  const setStops = useStopsStore(state => state.setStops)
  const {checkAuth} = useUserStore();

  useEffect(() => {
    void checkAuth();
  }, [ checkAuth]);

   useEffect(() => {
      const fetchStops = async () => {
        const data = await getStops();
        setStops(data.stops);
     };
     
      void fetchStops();
    }, []);
  
  return (
    <div style={{position: "relative"}}>
      <Map />
      <UserProfileComp />
      <SearchPanel/>
    </div>
  );
}

export default App;
