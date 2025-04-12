import React, { useState, useEffect } from "react";
import GaugeChart from "react-gauge-chart";
import { auth, db } from "../config/firebase";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { useNavigate, Link } from "react-router-dom";
import "../styles/DashboardPage.css";

export default function DashboardPage() {
  const [temperature, setTemperature] = useState(null);
  const [temperatureTimestamp, setTemperatureTimestamp] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [humidityTimestamp, setHumidityTimestamp] = useState(null);
  const [soilMoisture, setSoilMoisture] = useState(null);
  const [soilTimestamp, setSoilTimestamp] = useState(null);
  const [rain, setRain] = useState(null);
  const [rainTimestamp, setRainTimestamp] = useState(null);
  const [pirStatus, setPirStatus] = useState(null);
  const [pirTimestamp, setPirTimestamp] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSensorData = (sensorRef, setValue, setTimestamp) => {
      onValue(sensorRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const latestKey = Object.keys(data).sort().pop();
          if (latestKey) {
            setValue(data[latestKey].value);
            setTimestamp(new Date(latestKey * 1000).toLocaleString());
          }
        }
      });
    };

    fetchSensorData(query(ref(db, "tempsensordata"), limitToLast(1)), setTemperature, setTemperatureTimestamp);
    fetchSensorData(query(ref(db, "humidtysensordata"), limitToLast(1)), setHumidity, setHumidityTimestamp);
    fetchSensorData(query(ref(db, "soilsensordata"), limitToLast(1)), setSoilMoisture, setSoilTimestamp);
    fetchSensorData(query(ref(db, "rainsensordata"), limitToLast(1)), setRain, setRainTimestamp);
    fetchSensorData(query(ref(db, "PIRsensordata"), limitToLast(1)), setPirStatus, setPirTimestamp);
  }, []);

  return (
    <div className="dashboard-container">
      <h1 style={{ color: "#FFD700" }}>SMART AGRICULTURE MONITORING SYSTEM</h1>
      
      <div className="dashboard-header">
        <h1 className="real-time-dashboard">REAL-TIME-DASHBOARD</h1>
        <div className="dashboard-buttons">
          <button className="history-button" onClick={() => navigate("/all-history")}>
            View All History
          </button>
          <button className="logout-button" onClick={() => { auth.signOut(); navigate("/"); }}>
            Logout
          </button>
        </div>
      </div>

      <div className="data-cards">
        {/* Temperature */}
        <div className="data-card">
          <h2>Temperature</h2>
          <div className="gauge-container">
            <GaugeChart id="temp-gauge" percent={temperature / 100} nrOfLevels={20} colors={["#00ff00", "#ff0000"]} hideText={true} />
          </div>
          <p>{temperature !== null ? `${temperature}°C` : "Loading..."}</p>
          <p><strong>Timestamp:</strong> {temperatureTimestamp || "Loading..."}</p>
          <Link to="/temp-history" className="view-history-link">View History</Link>
        </div>

        {/* Humidity */}
        <div className="data-card">
          <h2>Humidity</h2>
          <div className="gauge-container">
            <GaugeChart id="humidity-gauge" percent={humidity / 100} nrOfLevels={20} colors={["#00f", "#0ff"]} hideText={true} />
          </div>
          <p>{humidity !== null ? `${humidity}%` : "Loading..."}</p>
          <p><strong>Timestamp:</strong> {humidityTimestamp || "Loading..."}</p>
          <Link to="/humidity-history" className="view-history-link">View History</Link>
        </div>

        {/* Soil Moisture */}
        <div className="data-card">
          <h2>Soil Moisture</h2>
          <div className="gauge-container">
            <GaugeChart id="soil-gauge" percent={soilMoisture / 100} nrOfLevels={20} colors={["#8B4513", "#00ff00"]} hideText={true} />
          </div>
          <p>{soilMoisture !== null ? `${soilMoisture}%` : "Loading..."}</p>
          <p><strong>Timestamp:</strong> {soilTimestamp || "Loading..."}</p>
          <Link to="/soil-history" className="view-history-link">View History</Link>
        </div>

        {/* Rainfall */}
        <div className="data-card">
          <h2>Rainfall</h2>
          <div className="gauge-container">
            <GaugeChart id="rain-gauge" percent={rain} nrOfLevels={2} colors={["#00ff00", "#ff0000"]} />
          </div>
          <p>{rain === 1 ? "Rain Detected" : "No Rain Detected"}</p>
          <p><strong>Timestamp:</strong> {rainTimestamp || "Loading..."}</p>
          <Link to="/rain-history" className="view-history-link">View History</Link>
        </div>

        {/* PIR Sensor */}
        <div className="data-card">
          <h2>PIR Sensor</h2>
          <div className="gauge-container">
            <GaugeChart id="pir-gauge" percent={pirStatus} nrOfLevels={2} colors={["#00ff00", "#ff0000"]} />
          </div>
          <p>{pirStatus === 1 ? "Motion Detected" : "No Motion"}</p>
          <p><strong>Timestamp:</strong> {pirTimestamp || "Loading..."}</p>
          <Link to="/pir-history" className="view-history-link">View History</Link>
        </div>
      </div>
    </div>
  );
}
