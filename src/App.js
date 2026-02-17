import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Location from "./pages/Location.js";
import Home from "./pages/Home.js";
function App() {

  const emailAssociation = 'lacave504@gmail.com';
  const numAssociation = '06 79 20 37 31';
  const adresseAtelier = ['La Partagerie', '30 Rue Mozart', '92110 Clichy'];
  const adressePostale = ['La Cave 504', '12 rue forchot', '75009 Paris'];
  const LATITUDE = 48.90630186808196;
  const LONGITUDE = 2.3179054548937903;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home emailAssociation={emailAssociation} />} />
        <Route path="/location"
          element={<Location
            latitude={LATITUDE}
            longitude={LONGITUDE}
            emailAssociation={emailAssociation}
            numAssociation={numAssociation}
            adresseAtelier={adresseAtelier}
            adressePostale={adressePostale}
          />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
