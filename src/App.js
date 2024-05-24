import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import Map from "./components/Map";
import TypingAnimation from "./components/Typed";

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [splashRemoved, setSplashRemoved] = useState(false);
  

  useEffect(() => {
    const splashShown = localStorage.getItem("splashShown");


    if (!splashShown) {
      setFirstLoad(true);


     
      const removeSplashTimeout = setTimeout(() => {
        setFirstLoad(false);
        localStorage.setItem("splashShown", "true");
      }, 3000); 
      
      
      

      return () => {
        // clearTimeout(fadeOutTimeout);
        clearTimeout(removeSplashTimeout);
      };
    }
  }, []);

  setTimeout(() => {
    setSplashRemoved(true)
  }, 3000); 

  return (
    <>
      {firstLoad && (
        <div className={`splash ${splashDone ? "splash_done" : ""} ${splashRemoved ? "splash_remove" : ""}`}>
          <p>
            <TypingAnimation setSplashDone={setSplashDone} />
          </p>
        </div>
      )}
      <div className="App">
        <h1>Customer Location Pinning System</h1>
        <div className="map_cont">
          <Map />
        </div>
      </div>
    </>
  );
}

export default App;
