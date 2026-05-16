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