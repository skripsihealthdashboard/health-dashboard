const Chart = window.Chart;

// ======================
// CHART INSTANCES
// ======================

let bpmChart;
let glucoseChart;
let trendBPMChart;
let trendSpO2Chart;
let trendGlucoseChart;
let trendTemperatureChart;

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

// ======================
// INIT TRENDBPM CHART
// ======================

export function initTrendBPMChart() {

  const ctx =
    document
      .getElementById(
        "trendBPMChart"
      )
      .getContext("2d");

  trendBPMChart =
    new Chart(ctx, {

      type: "line",

      data: {

        labels: [],

        datasets: [

          {

            label:
              "Median BPM",

            data: [],

            borderWidth: 2,

            tension: 0.25

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false

      }

    });

}

//======================
// UPDATE TRENDBPM CHART
// ======================

export function updateTrendBPMChart(
  trendData
) {

  trendBPMChart.data.labels =
    trendData.map(
      item =>
        `Day ${item.day}`
    );

  trendBPMChart.data.datasets[0]
    .data =
    trendData.map(
      item =>
        item.value
    );

  trendBPMChart.update();

}

export function initTrendSpO2Chart() {

  const ctx =
    document
      .getElementById(
        "trendSpO2Chart"
      )
      .getContext("2d");

  trendSpO2Chart =
    new Chart(ctx, {

      type: "line",

      data: {

        labels: [],

        datasets: [

          {

            label:
              "Median SpO₂",

            data: [],

            borderWidth: 2

          }

        ]

      }

    });

}

export function updateTrendSpO2Chart(
  trendData
) {

  trendSpO2Chart.data.labels =
    trendData.map(
      item =>
        `Day ${item.day}`
    );

  trendSpO2Chart.data.datasets[0]
    .data =
    trendData.map(
      item =>
        item.value
    );

  trendSpO2Chart.update();

}


// ======================
// INIT TREND GLUCOSE CHART
// ======================
export function initTrendGlucoseChart() {

  const ctx =
    document
      .getElementById(
        "trendGlucoseChart"
      )
      .getContext("2d");

  trendGlucoseChart =
    new Chart(ctx, {

      type: "line",

      data: {

        labels: [],

        datasets: [

          {

            label:
              "Median Glucose",

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
// UPDATE TREND GLUCOSE CHART
// ======================
export function updateTrendGlucoseChart(
  trendData
) {

  if (!trendGlucoseChart) {

    return;

  }

  trendGlucoseChart.data.labels =
    trendData.map(

      item =>
        `Day ${item.day}`

    );

  trendGlucoseChart.data.datasets[0]
    .data =

    trendData.map(

      item =>
        item.value

    );

  trendGlucoseChart.update();

}

// ======================
// INIT TREND TEMPERATURE CHART
// ======================
export function initTrendTemperatureChart() {

  const ctx =
    document
      .getElementById(
        "trendTemperatureChart"
      )
      .getContext("2d");

  trendTemperatureChart =
    new Chart(ctx, {

      type: "line",

      data: {

        labels: [],

        datasets: [

          {

            label:
              "Median Temperature",

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
// UPDATE TREND TEMPERATURE CHART
// ======================
export function updateTrendTemperatureChart(
  trendData
) {

  if (!trendTemperatureChart) {

    return;

  }

  trendTemperatureChart.data.labels =
    trendData.map(

      item =>
        `Day ${item.day}`

    );

  trendTemperatureChart.data.datasets[0]
    .data =

    trendData.map(

      item =>
        item.value

    );

  trendTemperatureChart.update();

}