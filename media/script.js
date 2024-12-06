// Create map
let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

function timeToColor(time) {
  let age = (Date.now() - time) / (1000 * 60 * 30);
  return `hsl(${age}, 75%, 50%)`;
}

let geoLayer;
let geoData;
function refreshEarthquakes() {
  if (geoLayer) map.removeLayer(geoLayer);
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson')
    .then(res=>res.json())
    .then(res=>{
      geoData = res;
      document.getElementById('title').innerText = res.metadata.title;
      geoLayer = L.geoJSON(res, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: feature.properties.mag * 2,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillColor: timeToColor(feature.properties.time),
            fillOpacity: 0.75
          });
        },
        onEachFeature: function (feature, layer) {
            // Add popups with earthquake details
            layer.bindPopup(`
                <strong>${feature.properties.title}</strong><br>
                Magnitude: ${feature.properties.mag}<br>
                Time: ${new Date(feature.properties.time).toLocaleString()}
            `);
        }
      }).addTo(map);
    })
}

refreshEarthquakes()
setInterval(refreshEarthquakes, 2 * 60 * 1000);