// Create map
let standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Kartendaten: © OpenStreetMap-Mitwirkende, SRTM | Kartendarstellung: © OpenTopoMap (CC-BY-SA)'
})
let darkMode = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors, © CARTO'
});
let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, DeLorme, NAVTEQ'
});

let map = L.map('map', {
  layers: [standard],
  minZoom: 2,
  maxZoom: 18
}).setView([0, 0], 2);

L.control.layers({
  "Standard": standard,
  "Topology": topo,
  "Dark Mode": darkMode,
  "Satellite": satellite
}).addTo(map);

map.setMaxBounds(L.latLngBounds(L.latLng(-85, -Infinity), L.latLng(85, Infinity)));

function timeToColor(time) {
  let age = (Date.now() - time) / (1000 * 60 * 30);
  return `hsl(${age}, 75%, 50%)`;
}

let geoLayer;
let geoData;
function refreshEarthquakes() {
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson')
    .then(res=>res.json())
    .then(res=>{
      geoData = res;
      document.getElementById('title').innerText = res.metadata.title;
      document.getElementById('list').innerHTML = res.features.map(e=>`<div onclick="map.setView([${e.geometry.coordinates[1]}, ${e.geometry.coordinates[0]}], 10)">
  ${Math.floor(e.properties.mag*100)/100}
  <span>
    <p>${e.properties.title}</p>
    <p>${new Date(e.properties.time).toLocaleString()}</p>
  </span>
</div>`).join('');
      if (geoLayer) map.removeLayer(geoLayer);
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
          layer.bindPopup(`<strong>${feature.properties.title}</strong><br>
Magnitude: ${Math.floor(feature.properties.mag*100)/100}<br>
Time: ${new Date(feature.properties.time).toLocaleString()}`);
        }
      }).addTo(map);
    })
}

refreshEarthquakes()
setInterval(refreshEarthquakes, 2 * 60 * 1000);