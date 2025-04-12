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

export default function HumidityHistoryPage() {
  const [humidityHistory, setHumidityHistory] = useState([]);
  const [latestHumidity, setLatestHumidity] = useState(null);
  const navigate = useNavigate();

  // Data for the chart
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Humidity (%)",
        data: [],
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
    ],
  });

  useEffect(() => {
    const humidityRef = ref(db, "humidtysensordata");
    onValue(humidityRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const history = Object.keys(data).map((timestamp) => ({
          timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
          humidity: data[timestamp].value,
        }));

        setHumidityHistory(history.reverse());

        // Extract latest humidity
        const latestEntry = history[0];
        if (latestEntry) {
          setLatestHumidity(latestEntry.humidity);
        }

        // Update chart data
        const labels = history.map((entry) => entry.timestamp);
        const humidityData = history.map((entry) => entry.humidity);
        setChartData({
          labels,
          datasets: [
            {
              label: "Humidity (%)",
              data: humidityData,
              borderColor: "rgba(75,192,192,1)",
              fill: false,
            },
          ],
        });
      }
    });
  }, []);

  return (
    <div className="humidity-history-container">
      <h1>Humidity Sensor History</h1>
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>← Back to Dashboard</button>
        <button className="logout-button" onClick={() => { auth.signOut(); navigate("/"); }}> Logout</button>
      </div>

      {/* Flex container for Gauge & Graph */}
      <div className="sensor-flex-container">
        {/* Gauge on the left */}
        <div className="gauge-container">
          <h2>Current Humidity</h2>
          <div className="gauge">
            <CircularProgressbar
              value={latestHumidity || 0}
              text={`${latestHumidity || "0"}%`}
              styles={buildStyles({
                pathColor: latestHumidity > 70 ? "red" : latestHumidity > 40 ? "green" : "blue",
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

      {/* Humidity History Table */}
      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Humidity (%)</th>
            </tr>
          </thead>
          <tbody>
            {humidityHistory.length > 0 ? (
              humidityHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.timestamp}</td>
                  <td>{entry.humidity}%</td>
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