import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
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
import "../styles/ViewAllHistroy.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export default function SensorDataHistory() {
  const [sensorData, setSensorData] = useState({
    pir: [],
    rain: [],
    soil: [],
    temp: [],
    humidity: [],
  });

  const [latestValues, setLatestValues] = useState({
    pir: 0,
    rain: 0,
    soil: 0,
    temp: 0,
    humidity: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const sensorRefs = {
      pir: ref(db, "PIRsensordata"),
      rain: ref(db, "rainsensordata"),
      soil: ref(db, "soilsensordata"),
      temp: ref(db, "tempsensordata"),
      humidity: ref(db, "humidtysensordata"),
    };

    Object.keys(sensorRefs).forEach((sensor) => {
      onValue(sensorRefs[sensor], (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const history = Object.keys(data)
            .map((timestamp) => ({
              timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
              value: parseFloat(data[timestamp].value) || 0, // Ensure numeric values
            }))
            .reverse();

          setSensorData((prevData) => ({ ...prevData, [sensor]: history }));

          if (history.length > 0) {
            setLatestValues((prevValues) => ({
              ...prevValues,
              [sensor]: history[0].value,
            }));
          }
        }
      });
    });
  }, []);

  const generateChartData = (sensorType, label, color) => ({
    labels: sensorData[sensorType].map((entry) => entry.timestamp),
    datasets: [
      {
        label: label,
        data: sensorData[sensorType].map((entry) => entry.value),
        borderColor: color,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        fill: true,
        tension: 0, // Smooth the line
        //pointRadius: , // Make points visible
      },
    ],
  });

  return (
    <div className="sensor-data-history-container">
      <h1> HISTORY</h1>
      <div className="navigation-container">
        <button className="navigation-back-button" onClick={() => navigate(-1)}>
          ← Back to Dashboard
        </button>
        <button
          className="navigation-logout-button"
          onClick={() => {
            auth.signOut();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
      <div className="sensor-charts-container">
        {Object.keys(sensorData).map((sensor) => (
          <div className="sensor-container" key={sensor}>
            {/* Special Gauge for PIR and Rain Sensors */}
            <div className="sensor-gauge-container">
              <h2>{sensor.toUpperCase()} {sensor === "pir" || sensor === "rain" ? "Status" : "Sensor"}</h2>
              <GaugeChart
                id={`${sensor}-gauge`}
                nrOfLevels={sensor === "pir" || sensor === "rain" ? 2 : 10}
                percent={sensor === "pir" || sensor === "rain" ? (latestValues[sensor] ? 1 : 0) : latestValues[sensor] / 100}
                colors={["#ff6347", "#32CD32"]}
                arcWidth={0.3}
                textColor="#000"
              />
              <p className="para">{sensor === "pir" || sensor === "rain" ? (latestValues[sensor] ? "Detected" : "Not Detected") : `${latestValues[sensor]}%`}</p>
            </div>
            <div className="sensor-chart-container">
              <h2>{sensor.toUpperCase()}  Data</h2>
              <Line
                data={generateChartData(
                  sensor,
                  `${sensor.toUpperCase()} Sensor`
                )}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true, // Ensure graphs start from zero
                    },
                  },
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
