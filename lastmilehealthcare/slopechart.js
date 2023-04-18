// Set chart dimensions
const margin3 = { top: 70, right: 50, bottom: 30, left: 50 };

// Define tooltip
const tooltipsl = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// append the svg object to the body of the page
const slopeSvg = d3
  .select("#slopechart")
  .append("svg")
  .attr(
    "viewBox",
    `0 0 ${width + margin3.left + margin3.right} ${
      height + margin3.top + margin3.bottom
    }`
  )
  .attr("preserveAspectRatio", "xMidYMid meet") 
  .append("g")
  .attr("transform", `translate(${margin3.left}, ${margin3.top})`);

// Parse the Data
d3.csv("healthcare.csv").then(function (data) {

  // Color scale
  const color = d3.scaleOrdinal()
    .domain(["Polyclinic", "Restructured_Hospital", "Community_Hospital" ])
    .range([ "#02517a", "#c23b29", "#7b9570"]);

  dimensions = ["lastmileBus", "lastmileMRT","lastmileTaxi"];

  const y3 = {};
  for (const name of dimensions) {
    y3[name] = d3.scaleLinear().domain([0, 2600]).range([height, 0]);
  }

  const x3 = d3.scalePoint().range([0, width]).domain(dimensions);

  function path(d) {
    return d3.line()(
      dimensions.map(function (p) {
        return [x3(p), y3[p](d[p])];
      })
    );
  }
  const highlightedOpacity = 1;
  const fadedOpacity = 0.2;
  
  // Draw the lines
  slopeSvg
  .selectAll("myPath")
  .data(data)
  .join("path")
  .attr("class", function (d) {
    return "line " + d.hc_type.replace(/ /g, "_");
})  
  .attr("d", path)
  .style("fill", "none")
  .style("stroke", function(d) { return color(d.hc_type); })
  .style("opacity", "1")
  // Add mouseover and mouseout events to paths
  .on("mouseover", function(event, d) {
    // fade all paths except the one being hovered over
    slopeSvg.selectAll(".line")
        .style("opacity", fadedOpacity);
    // highlight paths with the same color as the hovered path
    slopeSvg.selectAll("." + d.hc_type)
        .style("opacity", highlightedOpacity)
        .style("stroke-width", "2px");
    // show tooltip
    tooltipsl
        .html(d.clinicName)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px")
        .transition()
        .duration(200)
        .style("opacity", 0.9);
})
.on("mouseout", function(d) {
  // reset opacity and stroke width of all paths
  slopeSvg.selectAll(".line")
      .style("opacity", 1)
      .style("stroke-width", "1.5px");
  // hide tooltip
  tooltipsl
      .transition()
      .duration(200)
      .style("opacity", 0);
});
  // Draw the axis:
  slopeSvg
    .selectAll("myAxis")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "axis")
    .attr("transform", function (d) {
      return `translate(${x3(d)})`;
    })
    .each(function (d) {
      d3.select(this).call(d3.axisLeft().ticks(5).scale(y3[d]));
    })
    // Add axis title
    .append("text")
    .style("text-anchor", "middle")
    .style("font-size", ".9rem")
    .attr("y", -5)
    .text(function (d) {
      if (d === "lastmileBus") {
        return "Bus Stop";
      } else if (d === "lastmileMRT") {
        return "MRT Station";
      } else if (d === "lastmileTaxi") {
        return "Taxi Stand";
      }
    })
    .classed("axis-title", true);
  
// Add color legend
const legend = slopeSvg.append("g")
  .attr("transform", `translate(0, -40)`);

const labelPadding = [0, 95, 140]; // set padding for each label

legend.selectAll(".legend-color")
  .data(color.domain())
  .join("rect")
  .attr("class", "legend-color")
  .attr("x", (d, i) => i * labelPadding[i])
  .attr("y", -25)
  .attr("width", 10)
  .attr("height", 10)
  .style("fill", color);

legend.selectAll(".legend-label")
  .data(color.domain())
  .join("text")
  .attr("class", "legend-label")
  .attr("x", (d, i) => i * labelPadding[i] + 15)
  .attr("y", -15)
  .text(d => {
    if (d === "Polyclinic") {
      return "Polyclinic";
    } else if (d === "Restructured_Hospital") {
      return "Restructured Hospital";
    } else if (d === "Community_Hospital") {
      return "Community Hospital";
    }
  })
  .style("font-size", "1rem");

});

// Add walking distance label
slopeSvg.append("text")
  .attr("class", "walking-distance-label")
  .attr("x", 0)
  .attr("y", -25)
  .style("text-anchor", "start")
  .text("Walking distance (metres) from:");
