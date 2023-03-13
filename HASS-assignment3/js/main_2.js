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
    this.initvis2();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initvis2() {
    let vis2 = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis2.width =
      vis2.config.containerWidth -
      vis2.config.margin.left -
      vis2.config.margin.right;
    vis2.height =
      vis2.config.containerHeight -
      vis2.config.margin.top -
      vis2.config.margin.bottom;

    // Initialize scales
    vis2.colorScale = d3
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

    vis2.xScale = d3.scaleLinear().range([0, vis2.width]);

    vis2.yScale = d3.scaleLinear().range([vis2.height, 0]);

    // Initialize axes
    vis2.xAxis = d3
      .axisBottom(vis2.xScale)
      .ticks(8)
      .tickSize(-vis2.height - 10)
      .tickPadding(10)
      .tickFormat((d) => d + " Y");

    vis2.yAxis = d3
      .axisLeft(vis2.yScale)
      .ticks(8)
      .tickSize(-vis2.width - 10)
      .tickPadding(10);

    // Define size of SVG drawing area
    vis2.svg = d3
      .select(vis2.config.parentElement)
      .attr("width", vis2.config.containerWidth)
      .attr("height", vis2.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis2.chart = vis2.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis2.config.margin.left},${vis2.config.margin.top})`
      );

    // Append empty x-axis group and move it to the bottom of the chart
    vis2.xAxisG = vis2.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis2.height})`);

    // Append y-axis group
    vis2.yAxisG = vis2.chart.append("g").attr("class", "axis y-axis");

    // Append both axis titles
    vis2.chart
      .append("text")
      .attr("class", "axis-title")
      .attr("y", vis2.height - 15)
      .attr("x", vis2.width + 10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Remaining Lease (nearest year)");

    vis2.svg
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
  updatevis2() {
    let vis2 = this;

    // Specificy accessor functions
    vis2.colorValue = (d) => d.flat_type;
    vis2.xValue = (d) => d.remain_leaseyears;
    vis2.yValue = (d) => d.resale_price;

    // Set the scale input domains
    vis2.xScale.domain([d3.max(vis2.data, vis2.xValue), 0]);
    vis2.yScale.domain([0, 1300000]);

    vis2.rendervis2();
  }

  /**
   * Bind data to vis2ual elements.
   */
  rendervis2() {
    let vis2 = this;

    // Add circles
    const circles = vis2.chart
      .selectAll(".point")
      .data(vis2.data, (d) => d.trail)
      .join("circle")
      .attr("class", "point")
      .attr("r", 4)
      .attr("cy", (d) => vis2.yScale(vis2.yValue(d)))
      .attr("cx", (d) => vis2.xScale(vis2.xValue(d)))
      .attr("fill", (d) => vis2.colorScale(vis2.colorValue(d)));

    // Tooltip event listeners
    circles
      .on("mouseover", (event, d) => {
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis2.config.tooltipPadding + "px")
          .style("top", event.pageY + vis2.config.tooltipPadding + "px").html(`
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
    vis2.xAxisG.call(vis2.xAxis).call((g) => g.select(".domain").remove());

    vis2.yAxisG.call(vis2.yAxis).call((g) => g.select(".domain").remove());
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
    scatterplot2.updatevis2();
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

  // Filter data accordingly and update vis2
  scatterplot2.data = data2.filter(d => selectedflat_type.includes(d.flat_type));
  scatterplot2.updatevis2();
});

