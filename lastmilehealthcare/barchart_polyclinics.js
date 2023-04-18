// Set chart dimensions
const margin = { top: 20, right: 50, bottom: 30, left: 250 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Define the x and y scales
const x = d3.scaleLinear().range([0, width]);

const y = d3.scaleBand().range([0, height]).padding(0.1);

// Create the SVG container
const svg = d3
  .select("#bar-chart")
  .attr(
    "viewBox",
    `0 0 ${width + margin.left + margin.right} ${
      height + margin.top + margin.bottom
    }`
  )
  .attr("preserveAspectRatio", "xMidYMid meet") // Add the preserveAspectRatio attribute
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create a tooltip div
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const getTooltipText = (d, distanceKey) => {
  return `<strong>${d.clinicName}</strong><br>
        ${
          distanceKey === "lastmileBus"
            ? `Nearest Bus Stop Location: <strong>${d.busLocation}</strong><br>`
            : distanceKey === "lastmileMRT"
            ? `Nearest MRT: <strong>${d.mrtNameExit}</strong><br>`
            : distanceKey === "lastmileTaxi"
            ? `<strong>Taxi Stand</strong><br>`
            : `Shortest walking distance is by taking: <strong>${d.lastmile_shortest}</strong><br>`
        }
        Walking distance: <strong>${d[distanceKey]}</strong> metres<br>
        Walking duration: <strong>${
          d[distanceKey + "_time"]
        }</strong> minutes*<br>
        * Assuming seniors' walking speed of 58m/min`;
};

// Load and process the data for the selected travel mode
const loadAndProcessData = (travelMode) => {
  let distanceKey, tooltipText;
  switch (travelMode) {
    case "Bus":
      distanceKey = "lastmileBus";
      tooltipText = (d) => getTooltipText(d, distanceKey);
      break;
    case "MRT":
      distanceKey = "lastmileMRT";
      tooltipText = (d) => getTooltipText(d, distanceKey);
      break;
    case "Taxi":
      distanceKey = "lastmileTaxi";
      tooltipText = (d) => getTooltipText(d, distanceKey);
      break;
    case "Min":
      distanceKey = "lastmileMin";
      tooltipText = (d) => getTooltipText(d, distanceKey);
      break;
  }
  d3.csv("healthcare.csv").then((data) => {
    // Filter the data by whether hc facilty is polyclinic
    data = data.filter(d => d.hc_type === "Polyclinic");
    // Sort the data by the selected distance column in descending order
    data.sort((a, b) => d3.descending(+a[distanceKey], +b[distanceKey]));

    // Update the x-scale domain to use the selected distance column
    x.domain([0, d3.max(data, (d) => +d[distanceKey])]);

    // Update the y-scale domain with the clinic names
    y.domain(data.map((d) => d.clinicName));

    // Update the bars to use the selected distance column
    const bars = svg.selectAll(".bar").data(data);

    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => y(d.clinicName))
      .attr("height", y.bandwidth())
      .merge(bars)
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1).html(tooltipText(d));
      })
      .on("mousemove", (event) => {
        const [tooltipWidth, tooltipHeight] = [100, 30]; // set the width and height of the tooltip
        const tooltipLeft = event.pageX - tooltipWidth / 2; // calculate the left position of the tooltip
        const tooltipTop = event.pageY - tooltipHeight + 30; // calculate the top position of the tooltip
        tooltip
          .style("left", `${tooltipLeft}px`)
          .style("top", `${tooltipTop}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .attr("width", (d) => x(+d[distanceKey]));

    bars.exit().remove();

    // Update the labels to use the selected distance column
    const labels = svg.selectAll(".label").data(data);

    labels
    .enter()
    .append("text")
    .attr("class", "label")
    .merge(labels)
    .transition()
    .duration(1000)
    .attr("x", (d) => x(+d[distanceKey]) + 5) // set the x position to the end of the bar + 5 pixels
    .attr("y", (d) => y(d.clinicName) + y.bandwidth() / 2 + 6) // set the y position to the middle of the bar
    .text((d) => `${d[distanceKey + "_time"]} min`) // set the label text to d[distanceKey + "_time"]
    .style("font-size", "12px")
    .style("fill", "#01256B");

labels.exit().remove();


    let constantValue;
switch (travelMode) {
  case "Bus":
    // Get the average of the 'lastmileBus' column
    constantValue = d3.mean(data, (d) => +d.lastmileBus).toFixed(1);
    break;
  case "MRT":
    constantValue = d3.mean(data, (d) => +d.lastmileMRT).toFixed(1);
    break;
  case "Taxi":
    constantValue = d3.mean(data, (d) => +d.lastmileTaxi).toFixed(1);
    break;
  case "Min":
    constantValue = d3.mean(data, (d) => +d.lastmileMin).toFixed(1);
    break;
}

    // Add the constant line
    svg.select(".constant-line").remove();
    svg
      .append("line")
      .attr("class", "constant-line")
      .attr("x1", x(constantValue))
      .attr("x2", x(constantValue))
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", "#A1240F")
      .style("stroke-width", 2);


    // Remove the text element
    d3.select('#average-text').remove();
    
    // Add the text element with the updated value
    svg.append("text")
      .attr("id", "average-text")
      .attr("text-anchor", "start")
      .attr("x", x(constantValue) + 5)
      .attr("y", height - 20)
      .text(`Average distance ≈ ${constantValue}m`);

    // Update the x-axis to use the selected distance column
    svg.select(".x-axis").transition().duration(1000).call(d3.axisTop(x));

    // Update the y-axis
    svg.select(".y-axis").transition().duration(1000).call(d3.axisLeft(y));
  });
};

// Load and process the data for the initial travel mode
loadAndProcessData("Bus");

// Add an event listener to the travel-mode filter
const travelModeFilter = document.getElementById("travel-mode");
travelModeFilter.addEventListener("change", () => {
  const selectedTravelMode = travelModeFilter.value;
  loadAndProcessData(selectedTravelMode);
});

// Add the x-axis
svg
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, 0)`)
  .call(d3.axisTop(x));

// Add the y-axis
svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));
