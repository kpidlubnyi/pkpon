import { Map } from "./components/Map/Map.js";
import { getStops } from "../src/services/mapService.js";
import { useEffect, useState } from "react";
import type { Stop } from "./types/mapTypes.js";

function App() {
  const [stops, setStops] = useState<Stop[]>([]);
  
   useEffect(() => {
      const fetchStops = async () => {
        const data = await getStops();
        setStops(data.stops);
     };
     
      void fetchStops();
    }, []);
  
  return (
    <>
      <Map stops={stops} />
    </>
  );
}

export default App;
