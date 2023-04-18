
// Create the svg3 container
const svg3 = d3
  .select("#bar-chart-3")
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
const loadAndProcessData3 = (travelMode) => {
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
     data = data.filter(d => d.hc_type === "Community_Hospital");
    // Sort the data by the selected distance column in descending order
    data.sort((a, b) => d3.descending(+a[distanceKey], +b[distanceKey]));

    // Update the x-scale domain to use the selected distance column
    x.domain([0, d3.max(data, (d) => +d[distanceKey])]);

    // Update the y-scale domain with the clinic names
    y.domain(data.map((d) => d.clinicName));

    // Update the bars to use the selected distance column
    const bars = svg3.selectAll(".bar").data(data);

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


    // Update the labels3 to use the selected distance column
    const labels3 = svg3.selectAll(".labels3").data(data);

    labels3
    .enter()
    .append("text")
    .attr("class", "labels3")
    .merge(labels3)
    .transition()
    .duration(1000)
    .attr("x", (d) => x(+d[distanceKey]) + 5) // set the x position to the end of the bar + 5 pixels
    .attr("y", (d) => y(d.clinicName) + y.bandwidth() / 2 + 6) // set the y position to the middle of the bar
    .text((d) => `${d[distanceKey + "_time"]} min`) // set the labels3 text to d[distanceKey + "_time"]
    .style("font-size", "12px")
    .style("fill", "#01256B");

labels3.exit().remove();

    let constantValue3;
    switch (travelMode) {
      case "Bus":
        constantValue3 = d3.mean(data, (d) => +d.lastmileBus).toFixed(1);
        break;
      case "MRT":
        constantValue3 = d3.mean(data, (d) => +d.lastmileMRT).toFixed(1);
        break;
      case "Taxi":
        constantValue3 = d3.mean(data, (d) => +d.lastmileTaxi).toFixed(1);
        break;
      case "Min":
        constantValue3 = d3.mean(data, (d) => +d.lastmileMin).toFixed(1);
        break;
    }

    // Add the constant line
    svg3.select(".constant-line3").remove();
    svg3
      .append("line")
      .attr("class", "constant-line3")
      .attr("x1", x(constantValue3))
      .attr("x2", x(constantValue3))
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", "#A1240F")
      .style("stroke-width", 2);

    // Remove the text element
    d3.select("#average-text3").remove();

    // Add the text element with the updated value
    svg3
      .append("text")
      .attr("id", "average-text3")
      .attr("text-anchor", "start")
      .attr("x", x(constantValue3) + 5)
      .attr("y", height - 20)
      .text(`Average distance ≈ ${constantValue3}m`);

    // Update the x-axis to use the selected distance column
    svg3.select(".x-axis").transition().duration(1000).call(d3.axisTop(x));

    // Update the y-axis
    svg3.select(".y-axis").transition().duration(1000).call(d3.axisLeft(y));
  });
};

// Load and process the data for the initial travel mode
loadAndProcessData3("Bus");

// Add an event listener to the travel-mode filter
const travelModeFilter3 = document.getElementById("travel-mode-3");
travelModeFilter3.addEventListener("change", () => {
  const selectedTravelMode = travelModeFilter3.value;
  loadAndProcessData3(selectedTravelMode);
});

// Add the x-axis
svg3
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, 0)`)
  .call(d3.axisTop(x));

// Add the y-axis
svg3.append("g").attr("class", "y-axis").call(d3.axisLeft(y));
