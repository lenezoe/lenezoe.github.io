// Load the healthcare.csv file using Plotly.d3.csv()
Plotly.d3.csv("healthcare.csv", function (err, rows) {
  // Create an empty array for each hc_type group and each transportation variable
  var polyclinicBus = [];
  var polyclinicMRT = [];
  var polyclinicTaxi = [];
  var restructuredHospitalBus = [];
  var restructuredHospitalMRT = [];
  var restructuredHospitalTaxi = [];
  var communityHospitalBus = [];
  var communityHospitalMRT = [];
  var communityHospitalTaxi = [];

  // Iterate over each row and add the corresponding values to the arrays
  rows.forEach(function (row) {
    if (row.hc_type === "Polyclinic") {
      polyclinicBus.push(row.lastmileBus);
      polyclinicMRT.push(row.lastmileMRT);
      polyclinicTaxi.push(row.lastmileTaxi);
    } else if (row.hc_type === "Restructured_Hospital") {
      restructuredHospitalBus.push(row.lastmileBus);
      restructuredHospitalMRT.push(row.lastmileMRT);
      restructuredHospitalTaxi.push(row.lastmileTaxi);
    } else if (row.hc_type === "Community_Hospital") {
      communityHospitalBus.push(row.lastmileBus);
      communityHospitalMRT.push(row.lastmileMRT);
      communityHospitalTaxi.push(row.lastmileTaxi);
    }
  });

  // Define the data for the boxplots
  var data = [
    {
      x: polyclinicBus,
      type: "box",
      orientation: "h",
      name: "Polyclinic - Bus Stop",
      marker: {
        color: "#02517a",
      },
    },
    {
      x: polyclinicMRT,
      type: "box",
      orientation: "h",
      name: "Polyclinic - MRT Station",
      marker: {
        color: "#c23b29",
      },
    },
    {
      x: polyclinicTaxi,
      type: "box",
      orientation: "h",
      name: "Polyclinic - Taxi Stand",
      marker: {
        color: "#7b9570",
      },
    },
    {
      x: restructuredHospitalBus,
      type: "box",
      orientation: "h",
      name: "Restructured Hospital - Bus Stop",
      marker: {
        color: "#02517a",
      },
    },
    {
      x: restructuredHospitalMRT,
      type: "box",
      orientation: "h",
      name: "Restructured Hospital - MRT Station",
      marker: {
        color: "#c23b29",
      },
    },
    {
      x: restructuredHospitalTaxi,
      type: "box",
      orientation: "h",
      name: "Restructured Hospital - Taxi Stand",
      marker: {
        color: "#7b9570",
      },
    },
    {
      x: communityHospitalBus,
      type: "box",
      orientation: "h",
      name: "Community Hospital - Bus Stop",
      marker: {
        color: "#02517a",
      },
    },
    {
      x: communityHospitalMRT,
      type: "box",
      orientation: "h",
      name: "Community Hospital - MRT Station",
      marker: {
        color: "#c23b29",
      },
    },
    {
      x: communityHospitalTaxi,
      type: "box",
      orientation: "h",
      name: "Community Hospital - Taxi Stand",
      marker: {
        color: "#7b9570",
      },
    },
  ];

  // Define the layout for the plot
  var layout = {
    xaxis: {
      title: "Distance (km)",
    },
    yaxis: {
      automargin: true,
      autorange: "reversed", // add this line to reverse the order of the boxplots
    },
    margin: {
      l: 200,
      r: 50,
      b: 50,
      t: 10,
      pad: 4,
    },
    legend: {
      x: 1,
      y: 1,
      traceorder: "normal",
      font: {
        family: "sans-serif",
        size: 12,
        color: "#000",
      },
      bgcolor: "#e7e2dc",
      borderwidth: 0,
    },
    plot_bgcolor: "rgba(0,0,0,0)", //remove the plot background
    paper_bgcolor: "#F3F0EC", //paper background
  };

  // Plot the boxplots using Plotly.newPlot()
  Plotly.newPlot("plot", data, layout);
});
