import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { auth } from "../config/firebase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/SensorHistory.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SoilSensorHistory() {
  const [soilHistory, setSoilHistory] = useState([]);
  const [latestSoilMoisture, setLatestSoilMoisture] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const soilRef = ref(db, "soilsensordata");
    onValue(soilRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const history = Object.keys(data)
          .map((key) => ({
            timestamp: new Date(Number(key) * 1000).toLocaleString(),
            soilMoisture: data[key].value,
          }))
          .reverse();

        setSoilHistory(history);

        if (history.length > 0) {
          setLatestSoilMoisture(history[0].soilMoisture);
        }
      }
    });
  }, []);

  const chartData = {
    labels: soilHistory.map((entry) => entry.timestamp),
    datasets: [
      {
        label: "Soil Moisture (%)",
        data: soilHistory.map((entry) => entry.soilMoisture),
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
    ],
  };

  return (
    <div className="soil-history-container">
      <h1>Soil Sensor Data History</h1>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>← Back to Dashboard</button>
        <button className="logout-button" onClick={() => { auth.signOut(); navigate("/"); }}> Logout</button>
      </div>

      <div className="sensor-flex-container">
        <div className="gauge-container">
          <h2>Current Soil Moisture</h2>
          <div className="gauge">
            <CircularProgressbar
              value={latestSoilMoisture || 0}
              text={`${latestSoilMoisture || "0"}%`}
              styles={buildStyles({
                pathColor: latestSoilMoisture > 60 ? "green" : latestSoilMoisture > 30 ? "orange" : "red",
                textColor: "#000",
                trailColor: "#d6d6d6",
                textSize: "18px",
              })}
            />
          </div>
        </div>

        <div className="chart-container">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Soil Moisture (%)</th>
            </tr>
          </thead>
          <tbody>
            {soilHistory.length > 0 ? (
              soilHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.timestamp}</td>
                  <td>{entry.soilMoisture}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">Loading...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
