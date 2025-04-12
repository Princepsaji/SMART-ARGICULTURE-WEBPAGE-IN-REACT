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
import GaugeChart from "react-gauge-chart";
import "../styles/SensorHistory.css";

// Register necessary components of Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function RainSensorHistory() {
  const [rainHistory, setRainHistory] = useState([]);
  const [currentRainLevel, setCurrentRainLevel] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Rain Sensor Status (1=Detected, 0=Not Detected)",
        data: [],
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
    ],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const rainSensorRef = ref(db, "rainsensordata");
    onValue(rainSensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const history = Object.keys(data).map((timestamp) => ({
          timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
          status: data[timestamp].value,
        }));

        setRainHistory(history.reverse());
        
        const latestData = history[0];
        if (latestData) {
          setCurrentRainLevel(latestData.status);
        }

        const labels = history.map((entry) => entry.timestamp);
        const statusData = history.map((entry) => (entry.status === 1 ? 1 : 0));

        setChartData({
          labels,
          datasets: [
            {
              label: "Rain Sensor Status (0=NO Rain  / 1=Rain Detected)",
              data: statusData,
              borderColor: "rgba(75,192,192,1)",
              fill: false,
            },
          ],
        });
      } else {
        setRainHistory([]);
        setCurrentRainLevel(0);
      }
    });
  }, []);

  return (
    <div className="rain-history-container">
      <h1>Rain Sensor History</h1>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>← Back to Dashboard</button>
        <button className="logout-button" onClick={() => { auth.signOut(); navigate("/"); }}> Logout</button>
      </div>

      <div className="sensor-flex-container">
        <div className="gauge-container">
          <h2>Rain Status</h2>
          <GaugeChart
            id="rain-gauge"
            nrOfLevels={2}
            percent={currentRainLevel}
            colors={["#ff6347", "#32CD32"]}
            arcWidth={0.3}
            textColor="#009"
          />
          <p className="para">{currentRainLevel === 0? "No Rain " : " Rain Detected "}</p>
        </div>

        <div className="chart-container">
          <Line
            data={chartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>

      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rainHistory.length > 0 ? (
              rainHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.timestamp}</td>
                  <td>{entry.status === 0 ? "No Rain" : "Rain Detected"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
