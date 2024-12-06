// Create map
let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let geoLayer;
let geoData;
function refreshEarthquakes() {
  if (geoLayer) map.removeLayer(geoLayer);
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson')
    .then(res=>res.json())
    .then(res=>{
      geoData = res;
      geoLayer = L.geoJSON(res, {
        /*onEachFeature: function(feature, layer) {
          layer.bindPopup(`more data later`);
        }*/
      }).addTo(map);
    })
}

refreshEarthquakes()