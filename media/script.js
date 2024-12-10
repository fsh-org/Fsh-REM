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
L.control.scale({
  position: 'bottomright',
  metric: true,
  imperial: true
}).addTo(map);

map.setMaxBounds(L.latLngBounds(L.latLng(-85, -Infinity), L.latLng(85, Infinity)));

document.getElementById('map').insertAdjacentHTML('beforeend', `<button class="settings" onclick="document.getElementById('settings').open?document.getElementById('settings').close():document.getElementById('settings').show()" aria-label="Map settings"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 256 256"><path fill-rule="evenodd" clip-rule="evenodd" d="M128 203C169.421 203 203 169.421 203 128C203 86.5786 169.421 53 128 53C86.5786 53 53 86.5786 53 128C53 169.421 86.5786 203 128 203ZM128 160C145.673 160 160 145.673 160 128C160 110.327 145.673 96 128 96C110.327 96 96 110.327 96 128C96 145.673 110.327 160 128 160Z"/><path d="M105.303 32.0485C105.799 25.8098 111.007 21 117.265 21H137.735C143.993 21 149.201 25.8098 149.697 32.0485L152 61H103L105.303 32.0485Z"/><path d="M105.303 222.952C105.799 229.19 111.007 234 117.265 234H137.735C143.993 234 149.201 229.19 149.697 222.952L152 194H103L105.303 222.952Z"/><path d="M222.952 105.303C229.19 105.799 234 111.007 234 117.265L234 137.735C234 143.993 229.19 149.201 222.952 149.697L194 152L194 103L222.952 105.303Z"/><path d="M32.0485 105.303C25.8098 105.799 21 111.007 21 117.265L21 137.735C21 143.993 25.8098 149.201 32.0485 149.697L61 152L61 103L32.0485 105.303Z"/><path d="M180.068 43.7046C184.83 39.6387 191.917 39.9177 196.345 44.3453L210.809 58.8087C215.236 63.2364 215.515 70.3241 211.449 75.086L192.368 97.4336L157.72 62.7854L180.068 43.7046Z"/><path d="M43.951 179.34C39.8966 184.103 40.1806 191.181 44.6033 195.604L59.3963 210.397C63.819 214.819 70.8972 215.103 75.66 211.049L97.7846 192.215L62.7845 157.215L43.951 179.34Z"/><path d="M211.059 179.316C215.119 184.078 214.838 191.162 210.413 195.587L195.939 210.061C191.513 214.487 184.43 214.768 179.668 210.707L157.567 191.864L192.215 157.216L211.059 179.316Z"/><path d="M75.6599 43.9512C70.8971 39.8969 63.819 40.1808 59.3962 44.6036L44.6033 59.3964C40.1806 63.8192 39.8967 70.8973 43.951 75.6601L62.7846 97.7848L97.7846 62.7848L75.6599 43.9512Z"/></svg></button>
<dialog id="settings">
  <label>Range: <select id="range">
    <option value="2.5_day">Mag 2.5+ Day</option>
    <option value="all_day">All Day</option>
    <option value="4.5_week">Mag 4.5+ Week</option>
    <option value="2.5_week">Mag 2.5+ Week</option>
    <option value="all_week">All Week</option>
    <option value="significant_month">Significant Month</option>
    <option value="4.5_month">Mag 4.5+ Month</option>
    <option value="2.5_month">Mag 2.5+ Month</option>
    <option value="all_month">All Month</option>
  </select></label>
</dialog>`)

function timeToColor(time) {
  let age = (Date.now() - time) / (1000 * 60 * 30);
  if (age>50) {
    age = ((age-50)/2)+50;
  }
  if (age>75) {
    age = ((age-75)/2)+75;
  }
  if (age>100) {
    age = ((age-100)/2)+100;
  }
  return `hsl(${age}, 75%, 50%)`;
}

let geoLayer;
let geoData;
function refreshEarthquakes() {
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/'+document.getElementById('range').value+'.geojson')
    .then(res=>res.json())
    .then(res=>{
      geoData = res;
      document.getElementById('title').innerText = res.metadata.title;
      document.getElementById('count').innerText = res.features.length;
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
Type: ${feature.properties.type}<br>
Time: ${new Date(feature.properties.time).toLocaleString()}`);
        }
      }).addTo(map);
    })
}

refreshEarthquakes()
setInterval(refreshEarthquakes, 2 * 60 * 1000);
document.getElementById('range').onchange = refreshEarthquakes;