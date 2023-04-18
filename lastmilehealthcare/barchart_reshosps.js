
// Create the svg2 container
const svg2 = d3
  .select("#bar-chart-2")
  .attr(
    "viewBox",
    `0 0 ${width + margin.left + margin.right} ${
      height + margin.top + margin.bottom
    }`
  )
  .attr("preserveAspectRatio", "xMidYMid meet") // Add the preserveAspectRatio attribute
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load and process the data for the selected travel mode
const loadAndProcessData2 = (travelMode) => {
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
     // Filter the data by whether hc facilty is comm hosps or restructured hosps
     data = data.filter(d => d.hc_type === "Restructured_Hospital");
    // Sort the data by the selected distance column in descending order
    data.sort((a, b) => d3.descending(+a[distanceKey], +b[distanceKey]));

    // Update the x-scale domain to use the selected distance column
    x.domain([0, d3.max(data, (d) => +d[distanceKey])]);

    // Update the y-scale domain with the clinic names
    y.domain(data.map((d) => d.clinicName));

    // Update the bars to use the selected distance column
    const bars = svg2.selectAll(".bar").data(data);

    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => y(d.clinicName))
      .attr("height", y.bandwidth())
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1).html(tooltipText(d));
      })
      .on("mousemove", (event) => {
        const [tooltipwidth, tooltipheight] = [100, 30]; // set the width and height of the tooltip
        const tooltipLeft = event.pageX - tooltipwidth / 2; // calculate the left position of the tooltip
        const tooltipTop = event.pageY - tooltipheight + 30; // calculate the top position of the tooltip
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


    // Update the labels2 to use the selected distance column
    const labels2 = svg2.selectAll(".labels2").data(data);

    labels2
    .enter()
    .append("text")
    .attr("class", "labels2")
    .merge(labels2)
    .transition()
    .duration(1000)
    .attr("x", (d) => x(+d[distanceKey]) + 5) // set the x position to the end of the bar + 5 pixels
    .attr("y", (d) => y(d.clinicName) + y.bandwidth() / 2 + 6) // set the y position to the middle of the bar
    .text((d) => `${d[distanceKey + "_time"]} min`) // set the labels2 text to d[distanceKey + "_time"]
    .style("font-size", "12px")
    .style("fill", "#01256B");

labels2.exit().remove();

    let constantValue2;
    switch (travelMode) {
      case "Bus":
        constantValue2 = d3.mean(data, (d) => +d.lastmileBus).toFixed(1);
        break;
      case "MRT":
        constantValue2 = d3.mean(data, (d) => +d.lastmileMRT).toFixed(1);
        break;
      case "Taxi":
        constantValue2 = d3.mean(data, (d) => +d.lastmileTaxi).toFixed(1);
        break;
      case "Min":
        constantValue2 = d3.mean(data, (d) => +d.lastmileMin).toFixed(1);
        break;
    }

    // Add the constant line
    svg2.select(".constant-line2").remove();
    svg2
      .append("line")
      .attr("class", "constant-line2")
      .attr("x1", x(constantValue2))
      .attr("x2", x(constantValue2))
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", "#A1240F")
      .style("stroke-width", 2);

    // Remove the text element
    d3.select("#average-text2").remove();

    // Add the text element with the updated value
    svg2
      .append("text")
      .attr("id", "average-text2")
      .attr("text-anchor", "start")
      .attr("x", x(constantValue2) + 5)
      .attr("y", height - 20)
      .text(`Average distance ≈ ${constantValue2}m`);

    // Update the x-axis to use the selected distance column
    svg2.select(".x-axis").transition().duration(1000).call(d3.axisTop(x));

    // Update the y-axis
    svg2.select(".y-axis").transition().duration(1000).call(d3.axisLeft(y));
  });
};

// Load and process the data for the initial travel mode
loadAndProcessData2("Bus");

// Add an event listener to the travel-mode filter
const travelModeFilter2 = document.getElementById("travel-mode-2");
travelModeFilter2.addEventListener("change", () => {
  const selectedTravelMode = travelModeFilter2.value;
  loadAndProcessData2(selectedTravelMode);
});

// Add the x-axis
svg2
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, 0)`)
  .call(d3.axisTop(x));

// Add the y-axis
svg2.append("g").attr("class", "y-axis").call(d3.axisLeft(y));
