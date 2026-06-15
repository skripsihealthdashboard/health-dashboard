import {
  getSummaryData
}
from "./firebaseService.js";

export async function
exportSummaryCSV() {

  const rows =
    await getSummaryData();

  if (!rows.length) {

    alert(
      "No summary data"
    );

    return;

  }

  const header = [

    "Day",
    "SimDay",

    "Median BPM",
    "Median SpO2",

    "Median Glucose",
    "Median Temperature",

    "Sample Count"

  ];

  const csv = [

    header.join(","),

    ...rows.map(

      row => [

        row.day,

        row.sim_day,

        row.median_bpm,

        row.median_spo2,

        row.median_glucose,

        row.median_temperature,

        row.sample_count

      ].join(",")

    )

  ].join("\n");

  const blob =
    new Blob(

      [csv],

      {
        type:
          "text/csv"
      }

    );

  const url =
    URL.createObjectURL(
      blob
    );

  const a =
    document.createElement(
      "a"
    );

  a.href = url;

  a.download =
    "summary.csv";

  a.click();

  URL.revokeObjectURL(
    url
  );

}