import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PIRSensorHistory from "./pages/PIRSensorHistory";
import TempSensorHistory from "./pages/TempSensorHistory";
import HumidityHistoryPage from "./pages/HumidityHistoryPage";
import SoilSensorHistory from "./pages/SoilSensorHistory";
import RainSensorHistoryPage from "./pages/RainSensorHistoryPage";
import ViewAllHistory from "./pages/ViewAllHistory";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/pir-history" element={<PIRSensorHistory />} />
      <Route path="/temp-history" element={<TempSensorHistory />} />
      <Route path="/humidity-history" element={<HumidityHistoryPage />} />
      <Route path="/soil-history" element={<SoilSensorHistory />} />
      <Route path="/rain-history" element={<RainSensorHistoryPage />} />
      <Route path="/all-history" element={<ViewAllHistory />} />
    </Routes>
  );
}

export default App;
