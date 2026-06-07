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

// summary tracker
let lastSummaryTimestamp = 0;

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
// NEXT SUMMARY KEY
// ======================
async function getNextSummaryKey() {

  const snapshot =
    await db
      .ref("sensor/summary")
      .once("value");

  const data =
    snapshot.val();

  if (!data) {

    return "minute_001";

  }

  const count =
    Object.keys(data).length + 1;

  return `minute_${String(count)
    .padStart(3, "0")}`;

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

setInterval(

  autoGenerateSummary,

  5000

);

async function autoGenerateSummary() {

  try {

    // ambil summary terakhir
    const summarySnapshot =
      await db
        .ref("sensor/summary")
        .once("value");

    const summaries =
      summarySnapshot.val() || {};

    let lastTimestamp = 0;

    if (
      Object.keys(summaries).length > 0
    ) {

      const latestSummary =
        Object.values(summaries)
          .sort(
            (a, b) =>
              b.timestamp -
              a.timestamp
          )[0];

      lastTimestamp =
        latestSummary.timestamp || 0;

    }

    // ambil history
    const historySnapshot =
      await db
        .ref("sensor/history")
        .once("value");

    const history =
      historySnapshot.val();

    if (!history) return;

    const rows =
      Object.values(history)
        .filter(
          row =>
            Number(
              row.timestamp || 0
            ) > lastTimestamp
        )
        .sort(
          (a, b) =>
            a.timestamp -
            b.timestamp
        );

    if (rows.length < 20) {

      return;

    }

    const selectedRows =
      rows.slice(0, 20);

    console.log(
      "[AUTO SUMMARY] 20 samples found"
    );

    // nanti lanjut hitung median
    // dan save day_xxx

  }

  catch (err) {

    console.error(
      "[AUTO SUMMARY ERROR]",
      err
    );

  }

}

async function autoGenerateSummary() {

  try {

    // ======================
    // AMBIL SUMMARY
    // ======================
    const summarySnapshot =
      await db
        .ref("sensor/summary")
        .once("value");

    const summaries =
      summarySnapshot.val() || {};

    let lastTimestamp = 0;

    if (
      Object.keys(summaries).length > 0
    ) {

      const latestSummary =
        Object.values(summaries)
          .sort(
            (a, b) =>
              b.timestamp -
              a.timestamp
          )[0];

      lastTimestamp =
        latestSummary.timestamp || 0;

    }

    // ======================
    // AMBIL HISTORY
    // ======================
    const historySnapshot =
      await db
        .ref("sensor/history")
        .once("value");

    const history =
      historySnapshot.val();

    if (!history) {

      return;

    }

    // ======================
    // FILTER DATA BARU
    // ======================
    const rows =
      Object.values(history)

        .filter(
          row =>
            Number(
              row.timestamp || 0
            ) > lastTimestamp
        )

        .sort(
          (a, b) =>
            a.timestamp -
            b.timestamp
        );

    if (rows.length < 20) {

      console.log(
        `[AUTO SUMMARY] ${rows.length}/20`
      );

      return;

    }

    // ======================
    // AMBIL 20 DATA PERTAMA
    // ======================
    const selectedRows =
      rows.slice(0, 20);

    // ======================
    // BPM
    // ======================
    const bpmValues =
      selectedRows

        .map(
          r =>
            Number(
              r.avg_bpm
            )
        )

        .filter(
          v => !isNaN(v)
        );

    // ======================
    // SPO2
    // ======================
    const spo2Values =
      selectedRows

        .map(
          r =>
            Number(
              r.spo2
            )
        )

        .filter(
          v => !isNaN(v)
        );

    // ======================
    // GLUCOSE
    // ======================
    const glucoseValues =
      selectedRows

        .map(
          r =>
            Number(
              r.glucose
            )
        )

        .filter(
          v => !isNaN(v)
        );

    // ======================
    // TEMPERATURE
    // ======================
    const tempValues =
      selectedRows

        .map(
          r =>
            Number(
              r.temperature
            )
        )

        .filter(
          v => !isNaN(v)
        );

    // ======================
    // NOMOR DAY
    // ======================
    const nextDay =
      Object.keys(
        summaries
      ).length + 1;

    const dayKey =
      `day_${String(nextDay)
        .padStart(3, "0")}`;

    // ======================
    // SUMMARY
    // ======================
    const summary = {

      sim_day:
        nextDay,

      datetime:
        new Date()
          .toLocaleString(),

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
        selectedRows.length,

      first_sample_timestamp:
        selectedRows[0]
          .timestamp,

      last_sample_timestamp:
        selectedRows[
          selectedRows.length - 1
        ].timestamp,

      timestamp:
        Math.floor(
          Date.now() / 1000
        )

    };

    // ======================
    // SIMPAN
    // ======================
    await db

      .ref(
        `sensor/summary/${dayKey}`
      )

      .set(summary);

    console.log(
      `[SUMMARY CREATED] ${dayKey}`
    );

  }

  catch (err) {

    console.error(
      "[AUTO SUMMARY ERROR]",
      err
    );

  }

}

// ======================
// API SUMMARY
// ======================
app.get(
  "/api/summary",
  async (req, res) => {

    try {

      const snapshot =
        await db
          .ref("sensor/summary")
          .once("value");

      const data =
        snapshot.val();

      if (!data) {

        return res.json([]);

      }

      const summaries =
        Object.entries(data).map(

          ([key, value]) => ({

            key,

            ...value

          })

        );

      summaries.sort(

        (a, b) =>
          a.created_at -
          b.created_at

      );

      res.json(summaries);

    }

    catch (err) {

      console.error(
        "[Summary Error]",
        err
      );

      res.status(500).json({

        error:
          "Failed to fetch summary"

      });

    }

  }
);

// ======================
// API - TREND BPM
// ======================
app.get(
  "/api/trend/bpm",
  async (req, res) => {

    try {

      const snapshot =
        await db
          .ref("sensor/summary")
          .once("value");

      const data =
        snapshot.val();

      if (!data) {

        return res.json([]);

      }

      const result =
        Object.values(data)

          .sort(
            (a, b) =>
              a.sim_day -
              b.sim_day
          )

          .map(item => ({

            day:
              item.sim_day,

            value:
              item.median_bpm

          }));

      res.json(result);

    }

    catch (err) {

      console.error(err);

      res.status(500).json({
        error:
          "Failed to load trend"
      });

    }

  }
);

app.get(
  "/api/trend/glucose",
  async (req, res) => {

    try {

      const snapshot =
        await db
          .ref("sensor/summary")
          .once("value");

      const data =
        snapshot.val();

      if (!data) {

        return res.json([]);

      }

      const result =
        Object.values(data)

          .sort(
            (a, b) =>
              a.sim_day -
              b.sim_day
          )

          .map(item => ({

            day:
              item.sim_day,

            value:
              item.median_glucose

          }));

      res.json(result);

    }

    catch (err) {

      res.status(500).json({
        error:
          "Failed to load trend"
      });

    }

  }
);

app.get(
  "/api/trend/spo2",
  async (req, res) => {

    try {

      const snapshot =
        await db
          .ref("sensor/summary")
          .once("value");

      const data =
        snapshot.val();

      if (!data) {

        return res.json([]);

      }

      const result =
        Object.values(data)

          .sort(
            (a, b) =>
              a.sim_day -
              b.sim_day
          )

          .map(item => ({

            day:
              item.sim_day,

            value:
              item.median_spo2

          }));

      res.json(result);

    }

    catch (err) {

      res.status(500).json({
        error:
          "Failed to load trend"
      });

    }

  }
);

app.get(
  "/api/trend/temperature",
  async (req, res) => {

    try {

      const snapshot =
        await db
          .ref("sensor/summary")
          .once("value");

      const data =
        snapshot.val();

      if (!data) {

        return res.json([]);

      }

      const result =
        Object.values(data)

          .sort(
            (a, b) =>
              a.sim_day -
              b.sim_day
          )

          .map(item => ({

            day:
              item.sim_day,

            value:
              item.median_temperature

          }));

      res.json(result);

    }

    catch (err) {

      res.status(500).json({
        error:
          "Failed to load trend"
      });

    }

  }
);

// ======================
// API - LATEST SUMMARY
// ======================
app.get(
  "/api/summary/latest",
  async (req, res) => {

    try {

      const snapshot =
        await db
          .ref("sensor/summary")
          .once("value");

      const data =
        snapshot.val();

      if (!data) {

        return res.status(404)
          .json({
            error:
              "No summary found"
          });

      }

      const latest =
        Object.values(data)

          .sort(
            (a, b) =>
              b.sim_day -
              a.sim_day
          )[0];

      res.json(latest);

    }

    catch (err) {

      console.error(
        "[SUMMARY LATEST ERROR]",
        err
      );

      res.status(500)
        .json({
          error:
            "Failed to load latest summary"
        });

    }

  }
);

// ======================
// API - SUMMARY INFO
// ======================
app.get(
  "/api/summary/info",
  async (req, res) => {

    try {

      const snapshot =
        await db
          .ref("sensor/summary")
          .once("value");

      const data =
        snapshot.val() || {};

      const summaries =
        Object.values(data);

      const totalSamples =
        summaries.reduce(
          (sum, item) =>
            sum +
            (item.sample_count || 0),
          0
        );

      res.json({

        total_days:
          summaries.length,

        total_samples:
          totalSamples,

        latest_day:
          summaries.length

      });

    }

    catch (err) {

      res.status(500)
        .json({
          error:
            "Failed to load summary info"
        });

    }

  }
);