const Chart = window.Chart;

let chart;

// ======================
// INIT CHART
// ======================
export function initChart() {

  const ctx =
    document
      .getElementById("chart")
      .getContext("2d");

  chart = new Chart(ctx, {

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
// UPDATE CHART
// ======================
export function updateChart(value) {

  const t =
    new Date().toLocaleTimeString();

  chart.data.labels.push(t);

  chart.data.datasets[0]
    .data.push(value);

  if (chart.data.labels.length > 20) {

    chart.data.labels.shift();

    chart.data.datasets[0]
      .data.shift();

  }

  chart.update();

}