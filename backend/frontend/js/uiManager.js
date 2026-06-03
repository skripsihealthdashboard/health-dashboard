// ======================
// BPM
// ======================
export function updateBPM(value) {

  document
    .getElementById("bpm")
    .textContent =

    value !== null &&
    value !== undefined

      ? Number(value).toFixed(2)

      : "--";

}

// ======================
// AVG BPM
// ======================
export function updateAvgBPM(value) {

  document
    .getElementById("avg_bpm")
    .textContent =

    value !== null &&
    value !== undefined

      ? Number(value).toFixed(2)

      : "--";

}

// ======================
// SPO2
// ======================
export function updateSpO2(value) {

  document
    .getElementById("spo2")
    .textContent =

    value !== null &&
    value !== undefined

      ? Number(value).toFixed(0)

      : "--";

}

// ======================
// TEMPERATURE
// ======================
export function updateTemperature(value) {

  document
    .getElementById("temperature")
    .textContent =

    value !== null &&
    value !== undefined

      ? Number(value).toFixed(2)

      : "--";

}
// ======================
//GLUCOSE
// ======================

export function updateGlucose(
  value
) {

  document
    .getElementById(
      "glucose"
    )
    .textContent =

    value !== null &&
    value !== undefined

    ? Number(value).toFixed(0)

    : "--";
}

// ======================
// DEVICE
// ======================
export function updateDevice(device) {

  document
    .getElementById("device")
    .textContent = device || "-";

}

// ======================
// SENSOR TIME
// ======================
export function updateSensorTime(
  timestamp
) {

  if (!timestamp) {

    document
      .getElementById("sensorTime")
      .textContent = "--";

    return;

  }

  const formatted =
    new Date(timestamp)
      .toLocaleString();

  document
    .getElementById("sensorTime")
    .textContent = formatted;

}

// ======================
// DASHBOARD UPDATE
// ======================
export function updateDashboardTime() {

  document
    .getElementById("updated")
    .textContent =

    new Date()
      .toLocaleTimeString();

}

// ======================
// STATUS
// ======================
export function updateStatus(status) {

  const el =
    document.getElementById("status");

  el.textContent = status;

  el.className = "value";

  if (status === "NORMAL") {

    el.classList.add("status-normal");

  }

  else if (status === "LOW") {

    el.classList.add("status-low");

  }

  else if (status === "HIGH") {

    el.classList.add("status-high");

  }

}

// ======================
// FINGER
// ======================
export function updateFinger(finger) {

  const el =
    document.getElementById("finger");

  el.textContent =
    finger ? "ON" : "OFF";

  el.className = "value";

  if (finger) {

    el.classList.add("finger-on");

  }

  else {

    el.classList.add("finger-off");

  }

}

// ======================
// ALERT
// ======================
export function updateAlert(alert) {

  const el =
    document.getElementById("alertBox");

  el.textContent =
    "Alert: " + alert;

  el.className = "alert-box";

  if (alert === "NORMAL") {

    el.classList.add("alert-normal");

  }

  else {

    el.classList.add("alert-danger");

  }

}

// ======================
// DEVICE CONNECTION
// ======================
export function updateDeviceConnection(
  online
) {

  const el =
    document.getElementById(
      "deviceStatus"
    );

  el.textContent =
    online ? "ONLINE" : "OFFLINE";

  el.className = "value";

  if (online) {

    el.classList.add("online");

  }

  else {

    el.classList.add("offline");

  }

}