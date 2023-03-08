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
    
    scatterplot2 = new Scatterplot({ parentElement: '#scatterplot2'}, data2);
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