const Chart = window.Chart;

// ======================
// CHART INSTANCES
// ======================
let bpmChart;

let glucoseChart;

// ======================
// INIT BPM CHART
// ======================
export function initBPMChart() {

  const ctx =
    document
      .getElementById("BPMchart")
      .getContext("2d");

  bpmChart = new Chart(ctx, {

    type: "line",

    data: {

      labels: [],

      datasets: [

        {

          label: "AVG BPM",

          data: [],

          borderWidth: 2,

          tension: 0.25

        }

      ]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      animation: false

    }

  });

}

// ======================
// UPDATE BPM CHART
// ======================
export function updateBPMChart(
  value
) {

  const t =
    new Date()
      .toLocaleTimeString();

  bpmChart.data.labels.push(t);

  bpmChart.data.datasets[0]
    .data.push(value);

  if (
    bpmChart.data.labels.length > 20
  ) {

    bpmChart.data.labels.shift();

    bpmChart.data.datasets[0]
      .data.shift();

  }

  bpmChart.update();

}

// ======================
// INIT GLUCOSE CHART
// ======================
export function initGlucoseChart() {

  const ctx =
    document
      .getElementById(
        "glucoseChart"
      )
      .getContext("2d");

  glucoseChart = new Chart(ctx, {

    type: "line",

    data: {

      labels: [],

      datasets: [

        {

          label: "Glucose (mg/dL)",

          data: [],

          borderWidth: 2,

          tension: 0.25

        }

      ]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      animation: false

    }

  });

}

// ======================
// UPDATE GLUCOSE CHART
// ======================
export function updateGlucoseChart(
  value
) {

  const t =
    new Date()
      .toLocaleTimeString();

  glucoseChart.data.labels.push(t);

  glucoseChart.data.datasets[0]
    .data.push(value);

  if (
    glucoseChart.data.labels.length > 20
  ) {

    glucoseChart.data.labels.shift();

    glucoseChart.data.datasets[0]
      .data.shift();

  }

  glucoseChart.update();

}