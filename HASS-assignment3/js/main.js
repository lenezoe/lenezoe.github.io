/**
 * Load data from CSV file asynchronously and render scatter plot
 */
let data, scatterplot;
d3.csv('meanflatprices_mature2022.csv')
  .then(_data => {
    data = _data;
    data.forEach(d => {
      d.resale_price = +d.resale_price;
      d.remain_leaseyears = +d.remain_leaseyears;
    });
    
    scatterplot = new Scatterplot({ parentElement: '#scatterplot'}, data);
    scatterplot.updateVis();
  })
  .catch(error => console.error(error));


/**
 * Event listener: use color legend as filter
 */
d3.selectAll('.legend-btn').on('click', function() {
  // Toggle 'inactive' class
  d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
  
  // Check which categories are active
  let selectedflat_type = [];
  d3.selectAll('.legend-btn:not(.inactive)').each(function() {
    selectedflat_type.push(d3.select(this).attr('data-flat_type'));
  });

  // Filter data accordingly and update vis
  scatterplot.data = data.filter(d => selectedflat_type.includes(d.flat_type));
  scatterplot.updateVis();
});