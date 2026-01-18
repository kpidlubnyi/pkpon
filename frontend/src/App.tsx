import { Map } from "./components/Map/Map.js";
import { getStops } from "../src/services/mapService.js";
import { useEffect, useState } from "react";
import type { Stop } from "./types/mapTypes.js";
import { UserProfileComp } from "./components/UserProfile/UserProfileComp.js";
import { useUserStore } from "./store/UserStore.js";

function App() {
  const [stops, setStops] = useState<Stop[]>([]);
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
      <Map stops={stops} />
      <UserProfileComp />
    </div>
  );
}

export default App;
