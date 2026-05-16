// ======================
// MOVING AVERAGE
// ======================
export function movingAverage(
  data,
  windowSize = 5
) {

  if (!Array.isArray(data)) {

    return [];

  }

  return data.map((_, index) => {

    const start =
      Math.max(
        0,
        index - windowSize + 1
      );

    const subset =
      data.slice(start, index + 1);

    const sum =
      subset.reduce(
        (a, b) => a + b,
        0
      );

    return sum / subset.length;

  });

}

// ======================
// SIMPLE SPIKE FILTER
// ======================
export function removeSpike(
  currentValue,
  previousValue,
  threshold = 25
) {

  if (
    previousValue === null ||
    previousValue === undefined
  ) {

    return currentValue;

  }

  const diff =
    Math.abs(
      currentValue - previousValue
    );

  if (diff > threshold) {

    return previousValue;

  }

  return currentValue;

}