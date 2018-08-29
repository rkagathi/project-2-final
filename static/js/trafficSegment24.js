// Base URL for traffic segment data
var baseURL = "https://data.cityofchicago.org/resource/sxs8-h27x.json?";

// Basemap tiles
var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
});

// Create a baseMaps object
var baseMaps = {
  "Street Map": streetmap,
  "Dark Map": darkmap
};

// Customize slider bar
sliderControl = L.control.sliderControl({
  position: "topright", 
  startTimeIdx: 0,    // where to start looking for a timestring
  timeStrLength: 19,  // the size of  yyyy-mm-dd hh:mm:ss - if millis 
  // follow: 3,
  range: true,
  // isEpoch: true,
  // showAllOnStart: true,
});

// Play with date time
// Last 1 hour
var currentdate = new Date();
// console.log(currentdate);

// Promise to find the latest dataset
var promise1 = new Promise(function(resolve, reject) {
  nextQuery(currentdate);
  setTimeout(resolve, 2000, 'Success!');
});

promise1.then(function(value) {
  // console.log(value);
  // console.log(currentdate);
  var datetimeNow = datetimeRange(currentdate);
  // console.log(datetimeNow);
  console.log("Latest traffic data: " + datetimeNow[1]);

  // Last 24 hours
  var datetime24 = [];
  var URL24 = [];
  var datetimeX = currentdate;
  for (var i=0; i<24; i++) {
    // console.log(datetimeX);
    var datetimeRangeX = datetimeRange(datetimeX);
    datetime24.push(datetimeRangeX)
    var URLX = generateURL(baseURL, datetimeRangeX);
    URL24.push(URLX);
    datetimeX.setHours(datetimeX.getHours() - 1);
  }
  // console.log(datetime24);
  // console.log(URL24);

  // Polylines past 24 hours
  Promise.all(
    URL24.map(url => d3.json(url))
  ).then(function(files) {

    // Loop though hourly data to generate a list of polylines
    var polylines24 = [];
    var polylines = [];
    files.forEach((trafficDataX, i) => {
      // Clean traffic data
      trafficDataX, speedsX = cleanTraffic(trafficDataX);
      // console.log(trafficDataX);
      console.log(trafficDataX.length)

      // Polylines
      var timeStringX = datetime24[i][1];
      var polylinesX = generatePolyline(trafficDataX, timeStringX);
      polylines24.push(polylinesX);
      polylines = polylines.concat(polylinesX);
    })
    // console.log(polylines24);
    // console.log(polylines);
    console.log("Number of traffic data points: " + polylines.length);

    // Polyline layer
    var polylinesLayerNow = L.layerGroup(polylines24[0]);
    var polylinesLayer = L.layerGroup(polylines);

    // Stations of historical air quality
    var stationMarkers = [];
    for (var i=0; i<airQualityStations.sites.length; i++) {
      var sites = airQualityStations.sites[i];
      var paramCode = airQualityStations.paramCode[i];
      var pollutant = airQualityStations.pollutant[i];
      var lat = airQualityStations.lat[i];
      var lng = airQualityStations.lng[i];
      var markerX = L.marker([lat,lng]
        , {icon: myMarker}
      )
        .bindPopup(`<h3>Historical air quality station</h3><hr>Pollutant measured: ${pollutant}`);
      stationMarkers.push(markerX);
    }
    // console.log(stationMarkers);

    // Station of real-time air quality
    var URLAQI = ["https://api.waqi.info/search/?token=242a699adf1b9978649cb1c016132c79330694d1&keyword=chi_com", "https://api.waqi.info/search/?token=242a699adf1b9978649cb1c016132c79330694d1&keyword=Cicero2"];

    Promise.all(
      URLAQI.map(url => d3.json(url))
    ).then(function(AQIs) {

      var AQIMarkers = [];
      AQIs.forEach(AQIData => {
        var AQI = +AQIData.data[0].aqi;
        var AQITime = AQIData.data[0].time.stime;
        var stationName = AQIData.data[0].station.name;
        var latlng = AQIData.data[0].station.geo;
        var coloredMarker = AQItoColoredMarker(AQI);
        var AQIMarker = L.marker(latlng
           , {icon: coloredMarker}
        )
        .bindPopup(`<h3>Real-time air quality station</h3><hr>Station: ${stationName}<br>Air Quality Index: ${AQI}<br>Last updated: ${AQITime}`);
        AQIMarkers.push(AQIMarker);
      })
      // console.log(AQIMarkers);
      
      // Station layers
      stationMarkers = stationMarkers.concat(AQIMarkers)
      var stationLayer = L.layerGroup(stationMarkers);

      // Create an overlay object
      var overlayMaps = {
        "Hourly Traffic": polylinesLayer,
        "Latest Traffic": polylinesLayerNow,
        "Air Quality Stations": stationLayer,
      };
  
      // Define a map object
      var map = L.map("map", {
        center: [41.85, -87.66],
        zoom: 11,
        layers: [streetmap, polylinesLayer, stationLayer]
      });
  
      // Add the layer control to the map
      L.control.layers(baseMaps, overlayMaps, {collapsed: true}).addTo(map);
  
      // Add slider control
      var sliderControl = L.control.sliderControl({layer:polylinesLayer});
      map.addControl(sliderControl);
      sliderControl.startSlider();

    })

  })
  .catch(function(err) {
    // handle error here
    console.error('Oh dear, something went wrong: ' + err);
  })

});

