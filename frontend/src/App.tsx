import { Map } from "./components/Map/Map.js";
import { useEffect } from "react";
import { UserProfileComp } from "./components/UserProfile/UserProfileComp.js";
import { useUserStore } from "./store/UserStore.js";
import { SearchPanel } from "./components/SearchPanel/SearchPanel.js";
import { useStopsStore } from "./store/StopsStore.js";

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
      <SearchPanel/>
    </div>
  );
}

export default App;
