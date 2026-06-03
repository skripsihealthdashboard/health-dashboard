let lastDataTime = Date.now();

// ======================
// UPDATE LAST DATA TIME
// ======================
export function markDataReceived() {

  lastDataTime = Date.now();

}

// ======================
// CHECK CONNECTION
// ======================
export function isDataStale(
  timeout = 10000
) {

  const now = Date.now();

  return (
    now - lastDataTime
  ) > timeout;

}