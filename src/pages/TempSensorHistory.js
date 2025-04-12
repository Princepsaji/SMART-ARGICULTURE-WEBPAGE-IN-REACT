import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { auth } from "../config/firebase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/SensorHistory.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export default function TempSensorHistory() {
  const [tempHistory, setTempHistory] = useState([]);
  const [latestTemp, setLatestTemp] = useState(null);
  const navigate = useNavigate();

  // Data for the chart
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Temperature (°C)",
        data: [],
        borderColor: "rgb(70, 82, 82)",
        fill: false,
      },
    ],
  });

  useEffect(() => {
    const tempRef = ref(db, "tempsensordata");
    onValue(tempRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const history = Object.keys(data).map((timestamp) => ({
          timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
          temperature: data[timestamp].value,
        }));

        setTempHistory(history.reverse());

        // Extract latest temperature
        const latestEntry = history[0];
        if (latestEntry) {
          setLatestTemp(latestEntry.temperature);
        }

        // Update chart data
        const labels = history.map((entry) => entry.timestamp);
        const temperatureData = history.map((entry) => entry.temperature);
        setChartData({
          labels,
          datasets: [
            {
              label: "Temperature (°C)",
              data: temperatureData,
              borderColor: "rgba(75,192,192,1)",
              fill: false,
              
            },
          ],
        });
      }
    });
  }, []);

  return (
    <div className="temp-history-container">
      <h1>Temperature Sensor History</h1>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>← Back to Dashboard</button>
        <button className="logout-button" onClick={() => { auth.signOut(); navigate("/"); }}> Logout</button>
      </div>

      {/* Flex container for Gauge & Graph */}
      <div className="sensor-flex-container">
        {/* Gauge on the left */}

        <div className="gauge-container">
          <h2>Current Temperature</h2>
          <div className="gauge">
            
            <CircularProgressbar
              value={latestTemp || 0}
              text={`${latestTemp || "0"}°C`}
              styles={buildStyles({
                fontColor:"Black",
                pathColor: latestTemp > 30 ? "red" : latestTemp > 20 ? "orange" : "blue",
                textColor: "#000",
                trailColor: "#d6d6d6",
                textSize: "18px",
                
              })}
            />
          </div>
        </div>

        {/* Graph on the right */}
        <div className="chart-container">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Temperature History Table */}
      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Temperature (°C)</th>
            </tr>
          </thead>
          <tbody>
            {tempHistory.length > 0 ? (
              tempHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.timestamp}</td>
                  <td>{entry.temperature}</td>
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
