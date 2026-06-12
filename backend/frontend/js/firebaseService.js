// ======================
// DASHBOARD DATA
// ======================
export async function getDashboardData() {

  const res =
    await fetch("/api/dashboard");

  return await res.json();

}

// ======================
// DEVICE STATUS
// ======================
export async function getDeviceStatus() {

  const res =
    await fetch("/api/status");

  return await res.json();

}

// ======================
// TREND BPM
// ======================

export async function
getBPMTrend() {

  const response =
    await fetch(
      "/api/trend/bpm"
    );

  return await response.json();

}

export async function
getSpO2Trend() {

  const response =
    await fetch(
      "/api/trend/spo2"
    );

  return await response.json();

}

export async function
getGlucoseTrend() {

  const response =
    await fetch(
      "/api/trend/glucose"
    );

  return await response.json();

}

export async function
getTemperatureTrend() {

  const response =
    await fetch(
      "/api/trend/temperature"
    );

  return await response.json();

}
