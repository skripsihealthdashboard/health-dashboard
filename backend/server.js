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
// MEDIAN
// ======================
function calculateMedian(values) {

  if (!values.length) {
    return null;
  }

  const sorted =
    [...values].sort(
      (a, b) => a - b
    );

  const middle =
    Math.floor(
      sorted.length / 2
    );

  if (
    sorted.length % 2 === 0
  ) {

    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;

  }

  return sorted[middle];

}

// ======================
// STATUS LOGIC
// ======================
function detectBPMStatus(bpm) {

  if (!Number.isFinite(bpm)) {
    return "NO DATA";
  }

  if (bpm < 60) {
    return "LOW";
  }

  if (bpm > 100) {
    return "HIGH";
  }

  return "NORMAL";
}

// ======================
// ALERT LOGIC
// ======================
// DITAMBAH:
// Letaknya setelah detectBPMStatus()
// ======================
function detectHealthAlert(data) {

  if (!data) {
    return "NO DATA";
  }

  if (data.spo2 !== null && data.spo2 < 90) {
    return "LOW SPO2";
  }

  if (data.avg_bpm !== null && data.avg_bpm > 120) {
    return "HIGH BPM";
  }

  if (data.avg_bpm !== null && data.avg_bpm < 50) {
    return "LOW BPM";
  }

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

      glucose: safeNumber(data.glucose),

      finger: !!data.finger,

      ir: safeNumber(data.ir),

      device_id: data.device_id || "-",

      timestamp: data.timestamp || Date.now(),

      status: detectBPMStatus(
        safeNumber(data.avg_bpm)
      ),

      // ======================
      // DITAMBAH:
      // alert system
      // ======================
      alert: detectHealthAlert({
        spo2: safeNumber(data.spo2),
        avg_bpm: safeNumber(data.avg_bpm)
      })

    };

    console.log("[Firebase Latest]", latestData);

  },

  (error) => {

    console.error("[Firebase Error]", error);

  }

);

// ======================
// API - DASHBOARD
// ======================
app.get("/api/dashboard", (req, res) => {

  if (!latestData) {

    return res.status(204).json({
      message: "No data yet"
    });

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
// API - STATUS
// ======================
// DITAMBAH:
// Letaknya setelah /api/health
// ======================
app.get("/api/status", (req, res) => {

  const now = Date.now();

  const lastUpdate =
  (latestData?.timestamp || 0)
  * 1000;

  const diff = now - lastUpdate;

  const online = diff < 30000;

  res.json({

    online,

    lastUpdate,

    delay_ms: diff

  });

});

// ======================
// API - HISTORY
// ======================
app.get("/api/history", async (req, res) => {

  try {

    // ======================
    // DITAMBAH:
    // dynamic limit
    // ======================
    const limit =
      Number(req.query.limit) || 100;

    const snapshot = await db
      .ref("sensor/history")
      .limitToLast(limit)
      .once("value");

    const data = snapshot.val();

    if (!data) {
      return res.json([]);
    }

    const formatted =
      Object.entries(data).map(

        ([id, value]) => ({

          id,

          ...value

        })

      );

    // ======================
    // SORT TIMESTAMP
    // ======================
    formatted.sort(

      (a, b) =>
        a.timestamp - b.timestamp

    );

    res.json(formatted);

  } catch (err) {

    console.error(
      "[History Error]",
      err
    );

    res.status(500).json({

      error: "Failed to fetch history"

    });

  }

});


// ======================
// API - GENERATE SUMMARY
// ======================
app.get(
  "/api/generate-summary",
  async (req, res) => {

    try {

      const snapshot =
        await db
          .ref("sensor/history")
          .limitToLast(20)
          .once("value");

      const data =
        snapshot.val();

      if (!data) {

        return res.status(404)
          .json({

            error:
              "No history data"

          });

      }

      const rows =
        Object.values(data);

      const bpmValues =
        rows
          .map(
            r =>
              safeNumber(
                r.avg_bpm
              )
          )
          .filter(
            v => v !== null
          );

      const spo2Values =
        rows
          .map(
            r =>
              safeNumber(
                r.spo2
              )
          )
          .filter(
            v => v !== null
          );

      const glucoseValues =
        rows
          .map(
            r =>
              safeNumber(
                r.glucose
              )
          )
          .filter(
            v => v !== null
          );

      const tempValues =
        rows
          .map(
            r =>
              safeNumber(
                r.temperature
              )
          )
          .filter(
            v => v !== null
          );

      const summary = {

        median_bpm:
          calculateMedian(
            bpmValues
          ),

        median_spo2:
          calculateMedian(
            spo2Values
          ),

        median_glucose:
          calculateMedian(
            glucoseValues
          ),

        median_temperature:
          calculateMedian(
            tempValues
          ),

        sample_count:
          rows.length,

        timestamp:
          Date.now()

      };

      res.json(summary);

    }

    catch (err) {

      console.error(
        "[Summary Error]",
        err
      );

      res.status(500)
        .json({

          error:
            "Failed to generate summary"

        });

    }

  }
);


// ======================
// START SERVER
// ======================
app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Server running on port ${PORT}`
  );

});