// Define the CSV file path
const csvFilePath = 'Walkability_Audit_Agg7Jun.csv';

// Initialize Leaflet map
const map = L.map('map').setView([1.35, 103.85], 15);

// Add the OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  opacity: 0.5, // Set the opacity of the tile layer
}).addTo(map);

// Parse the CSV file
Papa.parse(csvFilePath, {
  header: true,
  download: true,
  dynamicTyping: true,
  complete: function(results) {
    const data = results.data;
    const polylines = [];
    const uniqueHospitals = {}; // Track unique hospital names

    // Define the color scale for the intensity levels
    const colorScale = chroma.scale(['green', 'red']).domain([3, 1]);

    // Process the 'geometry', 'hospName', 'segment', and 'obstacles' columns
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const geometry = row.geometry;
      const hospName = row.hospName;
      const segment = row.segment;
      const paths_involved = row.paths_involved;
      const obstacles = row.obstacles;

      if (geometry && typeof geometry === 'string') {
        // Extract coordinates from LINESTRING
        const coordinates = geometry
          .match(/-?\d+\.\d+/g)
          .map((coord, index, array) => {
            // Swap latitude and longitude
            if (index % 2 === 0) {
              return [parseFloat(array[index + 1]), parseFloat(coord)];
            }
          })
          .filter(coord => coord !== undefined);

        // Create a Leaflet Polyline from the coordinates
        const polyline = L.polyline(coordinates, {
          color: colorScale(obstacles).hex(),
          opacity: 0.8,
          weight: 5, // Set the thickness of the polyline
        }).addTo(map);

        // Create a tooltip content with 'hospName' and 'segment'
        const tooltipContent = `<b>${hospName}</b><br>Segment: ${segment}<br>Path types: ${paths_involved}<br>Obstacle score: ${obstacles} / 3`;

        // Add a tooltip to the polyline
        polyline.bindTooltip(tooltipContent, { permanent: false, direction: 'auto' });

        // Create circle markers for each coordinate
        coordinates.forEach(coord => {
          const circleMarker = L.circleMarker(coord, {
            color: colorScale(obstacles).hex(),
            opacity: 1,
            weight: 1,
            fillColor: colorScale(obstacles).hex(),
            fillOpacity: 0.8,
            radius: 3, // Set the radius of the circle marker
          }).addTo(map);
          polylines.push(circleMarker);
        });

        if (!uniqueHospitals[hospName]) {
          // Create a link in the sidebar for the first instance of each hospital
          const sidebar = document.getElementById('sidebar');
          const link = document.createElement('a');
          link.textContent = hospName;
          link.addEventListener('click', function() {
            // Zoom in to the first route of the selected hospital
            map.fitBounds(polyline.getBounds());
          });
          sidebar.appendChild(link);

          uniqueHospitals[hospName] = true; // Mark the hospital as unique
        }

        polylines.push(polyline);
      }
    }

    // Fit the map to show all polylines and circle markers
    const polylineGroup = L.featureGroup(polylines);
    map.fitBounds(polylineGroup.getBounds());
  }
});
