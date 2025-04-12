import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { Line } from "react-chartjs-2";
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

export default function PIRSensorHistory() {
  const [pirHistory, setPirHistory] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(0);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "PIR Sensor Status (1=Detected, 0=Not Detected)",
        data: [],
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
    ],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const pirSensorRef = ref(db, "PIRsensordata");
    onValue(pirSensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const history = Object.keys(data).map((timestamp) => ({
          timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
          status: data[timestamp].value,
        }));

        setPirHistory(history.reverse());
        if (history[0]) {
          setCurrentStatus(history[0].status);
        }

        const labels = history.map((entry) => entry.timestamp);
        const statusData = history.map((entry) => (entry.status === 1 ? 1 : 0));

        setChartData({
          labels,
          datasets: [
            {
              label: "PIR Sensor Status (1=Detected / 0=Not Detected)",
              data: statusData,
              borderColor: "rgba(75,192,192,1)",
              fill: false,
            },
          ],
        });
      } else {
        setPirHistory([]);
        setCurrentStatus(0);
      }
    });
  }, []);

  return (
    <div className="pir-history-container">
      <h1>PIR Sensor History</h1>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>← Back to Dashboard</button>
        <button className="logout-button" onClick={() => { auth.signOut(); navigate("/"); }}> Logout</button>
      </div>
      
      <div className="sensor-flex-container">
        <div className="gauge-container">
          <h2>PIR Status</h2>
          <GaugeChart
            id="pir-gauge"
            nrOfLevels={2}
            percent={currentStatus}
            colors={["#ff6347", "#32CD32"]}
            arcWidth={0.3}
            textColor="#009"
          /> 
          <p className="para">{currentStatus === 1 ? "Detected" : "Not Detected"}</p>
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
            {pirHistory.length > 0 ? (
              pirHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.timestamp}</td>
                  <td>{entry.status === 1 ? "Detected" : "Not Detected"}</td>
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
