// ======================
// EXPORT CSV
// ======================
export function exportCSV(
  historyData,
  filename = "health_data.csv"
) {

  if (
    !Array.isArray(historyData) ||
    historyData.length === 0
  ) {

    alert("No data to export");

    return;

  }

  // HEADER
  const headers = [

    "timestamp",

    "avg_bpm"

  ];

  // ROWS
  const rows =
    historyData.map(item => [

      item.timestamp,

      item.avg_bpm

    ]);

  // COMBINE
  const csvContent = [

    headers.join(","),

    ...rows.map(
      row => row.join(",")
    )

  ].join("\n");

  // CREATE FILE
  const blob =
    new Blob(
      [csvContent],
      { type: "text/csv" }
    );

  const url =
    URL.createObjectURL(blob);

  // DOWNLOAD
  const a =
    document.createElement("a");

  a.href = url;

  a.download = filename;

  a.click();

  URL.revokeObjectURL(url);

}