const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./firebase");

const app = express();

// ======================
// PORT
// ======================
const PORT = process.env.PORT || 3000;

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());

// ======================
// FRONTEND
// ======================
const frontendPath = path.join(__dirname, "frontend");

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ======================
// STATE CACHE
// ======================
let latestData = null;

// ======================
// VALIDATION HELPERS
// ======================
function safeNumber(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

// ======================
// STATUS LOGIC
// ======================
function detectBPMStatus(bpm) {
  if (!Number.isFinite(bpm)) return "NO DATA";
  if (bpm < 60) return "LOW";
  if (bpm > 100) return "HIGH";
  return "NORMAL";
}

// ======================
// FIREBASE LISTENER
// ======================
db.ref("sensor/latest").on(
  "value",
  (snapshot) => {
    const data = snapshot.val();

    if (!data) return;

    latestData = {
      bpm: safeNumber(data.bpm),
      avg_bpm: safeNumber(data.avg_bpm),
      spo2: safeNumber(data.spo2),
      temperature: safeNumber(data.temperature),
      finger: !!data.finger,
      ir: safeNumber(data.ir),
      device_id: data.device_id || "-",
      timestamp: data.timestamp || Date.now(),
      status: detectBPMStatus(safeNumber(data.avg_bpm))
    };

    console.log("[Firebase Latest]", latestData);
  },
  (error) => {
    console.error("[Firebase Error]", error);
  }
);

// ======================
// API - LATEST
// ======================
app.get("/api/dashboard", (req, res) => {
  if (!latestData) {
    return res.status(204).json({ message: "No data yet" });
  }

  res.json(latestData);
});

// ======================
// API - HEALTH
// ======================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime()
  });
});

// ======================
// API - HISTORY (IMPROVED)
// ======================
app.get("/api/history", async (req, res) => {
  try {
    const snapshot = await db
      .ref("sensor/history")
      .limitToLast(100)
      .once("value");

    const data = snapshot.val();

    if (!data) return res.json([]);

    const formatted = Object.entries(data).map(([id, value]) => ({
      id,
      ...value
    }));

    // sort by timestamp (penting untuk grafik)
    formatted.sort((a, b) => a.timestamp - b.timestamp);

    res.json(formatted);
  } catch (err) {
    console.error("[History Error]", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// ======================
// START SERVER
// ======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});