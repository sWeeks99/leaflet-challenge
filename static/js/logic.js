// GeoJSON, (Past 7 Days) All Earthquakes 
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create a map object and set the initial view coordinates
let map = L.map('map').setView([37.0902, -95.7129], 4); // sets view to USA

// Base layers
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
street.addTo(map);

// Legend
let legend = L.control({position:"bottomright"});

legend.onAdd = function (map) {
  let div = L.DomUtil.create("div", "legend");
  let grades = ['-10-9', '10-29', '30-49', '50-69', '70-89', '+90'];  // depth levels from low to highest; green to red
  let colors = ['green', 'lightgreen', 'yellow', 'orange', 'lightsalmon', 'red'];
  let labels = ['Depth Levels'];
  div.innerHTML = '<h4>' + labels + '</h4>'; // legend titel

// Loop through grades and colors to add entries with icons
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML += '<div class="grade"><span class="color-box" style="background-color:' + colors[i] + '"></span>' + grades[i] + '</div>';
  }
  // Adds white background for legend for better readability
  div.style.backgroundColor = 'white';
  div.style.padding = '4px 7px';
  div.style.fontWeight = 'bold';

  // adds color boxes to each respective entry, *used Xpert Learning assistance due to difficulties of implementing the icons of the legend
  let style = document.createElement('style');
  style.innerHTML = '.color-box { display: inline-block; width: 20px; height: 10px; margin-right: 5px; }';
  document.head.appendChild(style);
  
  return div;
};

legend.addTo(map);

// Function for calculating marker size based on each earthquake's magnitude value
function calculateMarkerSize(magnitude) {
  return magnitude * 3;
}

// Function to implement color scale based on depth
function calculateColor(depth) {
  // color scale based on depth
  if (-10 <= depth && depth < 10) { //(-10 - 9)
    return 'green';
  } else if (10 <= depth && depth < 30) { //(10 - 29)
    return 'lightgreen';
  } else if (30 <= depth && depth < 50) { //(30 - 49)
    return 'yellow';
  } else if (50 <= depth && depth < 70) { //(50 - 69)
    return 'orange';
  } else if (70 <= depth && depth < 90) { //(70 - 89)
    return 'lightsalmon';
  } else {
    return 'red';
  }
}

// API call and adding earthquake data to the map
d3.json(queryUrl).then(function(data) {
  addEarthquakesToMap(data);
});

// Adds GeoJSON data to the map
function addEarthquakesToMap(geojsonData) {
  L.geoJSON(geojsonData, {
    pointToLayer: function (feature, latlng) {
      let depth = feature.geometry.coordinates[2];
      let color = calculateColor(depth);
      let magnitude = feature.properties.mag;
      let radius = calculateMarkerSize(magnitude);
      
      return L.circleMarker(latlng, {
        radius: radius, // set radius of the circle marker based on mag
        fillColor: color, //color scale set up previously
        weight: 0.5, //thickness of the outline
        opacity: 0.5,
        fillOpacity: 0.8
      });
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`); //pop-up information: location, mag and depth
    }
  }).addTo(map);
}