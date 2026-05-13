const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./firebase");

const app = express();

// ======================
// PORT
// ======================
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ======================
// FRONTEND STATIC FILE
// ======================
const frontendPath = path.join(__dirname, "frontend");
console.log("Frontend path:", frontendPath);

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ======================
// LATEST SENSOR STORAGE
// ======================
let latestData = {
  bpm: null,
  avg_bpm: null,
  spo2: null,
  temperature: null,
  finger: false,
  ir: null,
  device_id: "-",
  status: "NO DATA",
  timestamp: null,
  last_update: null
};

// ======================
// STATUS DETECTION
// ======================
function detectBPMStatus(bpm) {
  if (!Number.isFinite(bpm)) return "NO DATA";

  if (bpm < 60) return "LOW";
  if (bpm > 100) return "HIGH";

  return "NORMAL";
}

// ======================
// FIREBASE REALTIME LISTENER
// ======================
try {

  db.ref("sensor/latest").on("value", (snapshot) => {

    const data = snapshot.val();

    if (!data) {
      console.log("[Firebase] No data available");
      return;
    }

    latestData = {
      bpm: Number(data.bpm) || null,
      avg_bpm: Number(data.avg_bpm) || null,
      spo2: Number(data.spo2) || null,
      temperature: Number(data.temperature) || null,
      finger: Boolean(data.finger),
      ir: Number(data.ir) || null,
      device_id: data.device_id || "-",
      timestamp: data.timestamp || null,
      last_update: new Date().toISOString(),
      status: detectBPMStatus(Number(data.avg_bpm))
    };

    console.log("[Firebase Update]", latestData);

  });

} catch (err) {

  console.error("[Firebase Listener Error]", err);

}

// ======================
// DASHBOARD API
// ======================
app.get("/api/dashboard", (req, res) => {

  res.json(latestData);

});

// ======================
// HEALTH CHECK
// ======================
app.get("/api/health", (req, res) => {

  res.json({
    status: "OK",
    uptime: process.uptime()
  });

});

// ======================
// START SERVER
// ======================
app.listen(PORT, "0.0.0.0", () => {

  console.log(`Server running on port ${PORT}`);

});