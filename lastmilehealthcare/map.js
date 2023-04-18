 // Initialize the map and set the view to Singapore
    var map = L.map('map').setView([1.3521, 103.8198], 12);

// Add the basemap layer
L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
  attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
  maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo(map);


function zoomToMarker() {
    var clinicSelect = document.getElementById('clinic-select');
    var clinicName = clinicSelect.value;
    if (!clinicName) return; // do nothing if no clinic is selected
    map.eachLayer(function (layer) {
      if (layer instanceof L.Marker && layer.getPopup().getContent().includes(clinicName)) {
        map.setView(layer.getLatLng(), 16);
      }
    });
  }
  
// Fetch the data from the healthcare.csv file
Papa.parse('healthcare.csv', {
    download: true,
    header: true,
    complete: function (results) {
        var clinicNames = []; // use an array to store unique clinic names
        results.data.forEach(function (row) {
          if (!clinicNames.includes(row.clinicName)) {
            clinicNames.push(row.clinicName); // add each unique clinic name to the array
          }
        });
        clinicNames.sort(); // sort the clinic names alphabetically
        var select = document.querySelector('select');
        // create an option element for each unique clinic name
        clinicNames.forEach(function (name) {
          var option = document.createElement('option');
          option.value = name;
          option.textContent = name;
          select.appendChild(option);
        });
        results.data.forEach(function (row) {
            // Add markers for the nearest bus, MRT, and taxi stands
            L.marker([row.busLat, row.busLong], {icon: L.icon({iconUrl: 'icons/bus-stop.png', iconSize: [20, 20]})}).addTo(map)
            .bindPopup(`<strong>${row.clinicName}</strong><br>
            Nearest Bus Stop: <strong>${row.busLocation} (${row.lastmileBus}m away)</strong>`);
            L.marker([row.mrtLat, row.mrtLong], {icon: L.icon({iconUrl: 'icons/train.png', iconSize: [20, 20]})}).addTo(map)
            .bindPopup(`<strong>${row.clinicName}</strong><br>
            Nearest MRT: <strong>${row.mrtNameExit} (${row.lastmileMRT}m away)</strong>`);
            L.marker([row.taxiLat, row.taxiLong], {icon: L.icon({iconUrl: 'icons/taxi.png', iconSize: [20, 20]})}).addTo(map)
            .bindPopup(`<strong>${row.clinicName}</strong><br>Nearest Taxi Stand: <strong>${row.lastmileTaxi}m away</strong>`);
            // Add a marker for the healthcare facility
            L.marker([row.clinicLat, row.clinicLong], {icon: L.icon({iconUrl: 'icons/hospital.png', iconSize: [30, 30]})}).addTo(map)
                .bindPopup(`Healthcare Facility: <strong>${row.clinicName}</strong><br>
                Nearest Bus Stop: <strong>${row.busLocation} (${row.lastmileBus}m away)</strong><br>
                Nearest MRT: <strong>${row.mrtNameExit} (${row.lastmileMRT}m away)</strong><br>
                Nearest Taxi Stand: <strong>${row.lastmileTaxi}m away</strong>`);

        });
    }
});

var clinicSelect = document.getElementById('clinic-select');
clinicSelect.addEventListener('change', zoomToMarker);
