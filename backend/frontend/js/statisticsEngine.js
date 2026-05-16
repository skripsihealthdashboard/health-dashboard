// ======================
// BASIC STATISTICS
// ======================
export function calculateStatistics(
  data
) {

  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    return null;

  }

  const min =
    Math.min(...data);

  const max =
    Math.max(...data);

  const sum =
    data.reduce(
      (a, b) => a + b,
      0
    );

  const avg =
    sum / data.length;

  return {

    min,

    max,

    average:
      Number(avg.toFixed(2)),

    count:
      data.length

  };

}