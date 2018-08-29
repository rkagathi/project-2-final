var url = "https://api.waqi.info/search/?token=242a699adf1b9978649cb1c016132c79330694d1&keyword=Cicero2";

d3.json(url).then(function(AQIData) {
  var AQI = +AQIData.data[0].aqi;
  var AQITime = AQIData.data[0].time.stime;
  var stationName = AQIData.data[0].station.name;

  var level = AQItoLevel(AQI)[0];
  var color = AQItoLevel(AQI)[1];
  var statement = AQItoLevel(AQI)[2];
  // console.log(AQItoLevel(AQI))

  // d3.select(".aqi-location-time").text(`${stationName}, ${AQITime}`);
  // d3.select(".aqi-value").text(AQI);
  // d3.select(".aqi-level").text(level);
  // d3.select(".aqi-statement").text(statement);
  // d3.select(".aqi-banner").style("background-color", color);
  // d3.select(".aqi-level").style("color", color);
})

function AQItoLevel(AQI) {
  if (AQI<50) {
    var level = "Good";
    var color = "green";
    var statement = "None.";
  }
  else if (AQI<100) {
    var level = "Moderate";
    var color = "gold";
    var statement = "Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.";
  }
  else if (AQI<150) {
    var level = "Unhealthy for Sensitive Groups";
    var color = "orange";
    var statement = "Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.";
  }
  else if (AQI<200) {
    var level = "Unhealthy";
    var color = "red";
    var statement = "Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion; everyone else, especially children, should limit prolonged outdoor exertion.";
  }
  else if (AQI<300) {
    var level = "Very Unhealthy";
    var color = "purple";
    var statement = "Active children and adults, and people with respiratory disease, such as asthma, should avoid all outdoor exertion; everyone else, especially children, should limit outdoor exertion.";
  }
  else {
    var level = "Hazardous";
    var color = "DarkRed";
    var statement = "Everyone should avoid all outdoor exertion.";
  }
  return [level, color, statement]
}