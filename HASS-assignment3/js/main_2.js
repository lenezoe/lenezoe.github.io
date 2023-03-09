class Scatterplot2 {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 550,
      containerHeight: _config.containerHeight || 480,
      margin: _config.margin || { top: 45, right: 20, bottom: 20, left: 75 },
      tooltipPadding: _config.tooltipPadding || 15,
    };
    this.data = _data;
    this.initVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Initialize scales
    vis.colorScale = d3
      .scaleOrdinal()
      .range([
        "#4e79a7",
        "#f28e2c",
        "#e15759",
        "#76b7b2",
        "#59a14f",
        "#edc949",
        "#af7aa1",
        "#ff9da7",
        "#9c755f",
        "#bab0ab",
      ]) // tableau colours
      .domain([
        "1 ROOM",
        "2 ROOM",
        "3 ROOM",
        "4 ROOM",
        "5 ROOM",
        "EXECUTIVE",
        "MULTI-GENERATION",
      ]);

    vis.xScale = d3.scaleLinear().range([0, vis.width]);

    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3
      .axisBottom(vis.xScale)
      .ticks(8)
      .tickSize(-vis.height - 10)
      .tickPadding(10)
      .tickFormat((d) => d + " Y");

    vis.yAxis = d3
      .axisLeft(vis.yScale)
      .ticks(8)
      .tickSize(-vis.width - 10)
      .tickPadding(10);

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

    // Append both axis titles
    vis.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("y", vis.height - 15)
      .attr("x", vis.width + 10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Remaining Lease (nearest year)");

    vis.svg
      .append("text")
      .attr("class", "axis-title")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", ".71em")
      .text("Average HDB Resale Price (SGD) in 2022");
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    // Specificy accessor functions
    vis.colorValue = (d) => d.flat_type;
    vis.xValue = (d) => d.remain_leaseyears;
    vis.yValue = (d) => d.resale_price;

    // Set the scale input domains
    vis.xScale.domain([d3.max(vis.data, vis.xValue), 0]);
    vis.yScale.domain([0, 1300000]);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;

    // Add circles
    const circles = vis.chart
      .selectAll(".point")
      .data(vis.data, (d) => d.trail)
      .join("circle")
      .attr("class", "point")
      .attr("r", 4)
      .attr("cy", (d) => vis.yScale(vis.yValue(d)))
      .attr("cx", (d) => vis.xScale(vis.xValue(d)))
      .attr("fill", (d) => vis.colorScale(vis.colorValue(d)));

    // Tooltip event listeners
    circles
      .on("mouseover", (event, d) => {
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
              <div class="tooltip-title">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0 }).format(d.resale_price)}</div>
              
              <ul>
                <li>Lease Remaining: ${d.remain_leaseyears} YEARS</li>
                <li>Town: ${d.town}</li>
                <li>Flat Type: ${d.flat_type}</li>
              </ul>
            `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      });

    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG.call(vis.xAxis).call((g) => g.select(".domain").remove());

    vis.yAxisG.call(vis.yAxis).call((g) => g.select(".domain").remove());
  }
}

/**
 * Load data from CSV file asynchronously and render scatter plot
 */
let data2, scatterplot2;
d3.csv('meanflatprices_nonmature2022.csv')
  .then(_data => {
    data2 = _data;
    data.forEach(d => {
      d.resale_price = +d.resale_price;
      d.remain_leaseyears = +d.remain_leaseyears;
    });
    
    scatterplot2 = new Scatterplot2({ parentElement: '#scatterplot2'}, data2);
    scatterplot2.updateVis();
  })
  .catch(error => console.error(error));


/**
 * Event listener: use color legend2 as filter
 */
d3.selectAll('.legend2-btn').on('click', function() {
  // Toggle 'inactive' class
  d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
  
  // Check which categories are active
  let selectedflat_type = [];
  d3.selectAll('.legend2-btn:not(.inactive)').each(function() {
    selectedflat_type.push(d3.select(this).attr('data-flat_type'));
  });

  // Filter data accordingly and update vis
  scatterplot2.data = data2.filter(d => selectedflat_type.includes(d.flat_type));
  scatterplot2.updateVis();
});

