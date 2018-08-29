// Stations for historical air quality data
var sites = [
  840170311016,
  840170310022,
  840170313103,
  840170310076,
  840170317002,
  840170314201,
  840170314007,
  840170314002,
  840170311601,
  840170310032,
  840170310001,
  840170314201,
];

var paramCode = [
  81102,
  81102,
  44201,
  44201,
  44201,
  44201,
  44201,
  44201,
  44201,
  44201,
  44201,
  42101,
];

var pollutant = [
  `PM10 0-10um STP`,
  `PM10 0-10um STP`,
  `Ozone`,
  `Ozone`,
  `Ozone`,
  `Ozone`,
  `Ozone`,
  `Ozone`,
  `Ozone`,
  `Ozone`,
  `Ozone`,
  `Carbon Monoxide`,
];

var lat = [
  41.80118,
  41.687165,
  41.965193,
  41.7514,
  42.062053,
  42.139996,
  42.060285,
  41.855243,
  41.66812,
  41.755832,
  41.670992,
  42.139996,
];

var lng = [
  -87.832349,
  -87.539315,
  -87.876265,
  -87.713488,
  -87.675254,
  -87.799227,
  -87.863225,
  -87.75247,
  -87.99057,
  -87.54535,
  -87.732457,
  -87.799227,
];

var airQualityStations = {
  sites: sites,
  paramCode: paramCode,
  pollutant: pollutant,
  lat: lat,
  lng: lng,
};

// Creates a marker with awesome markers
var myMarker = L.AwesomeMarkers.icon({
  icon: 'info-circle',
  prefix: 'fa',
  markerColor: 'cadetblue'
});
