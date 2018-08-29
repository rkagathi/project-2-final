// Fetch AQI data from api
const api24URL = "/api_aqi_24";

d3.json(api24URL).then(function(data) {

  console.log(data);

  data.marker.color = AQIstoColors(data.y)[0];
  data.text = AQIstoColors(data.y)[1];
  var traceData = [data];

  // console.log(data.y);
  
  // layout
  var layout = {
    // title: "tst",
    margin: {
      l: 50,
      r: 20,
      t: 20,
      b: 60
    },
    xaxis: { 
      title: "Time",
      // range: [startDate, endDate],
      type: "date",
    },
    yaxis: { 
      title: "Air Quality Index",
      // autorange: true,
      // range: [0, Math.max(...data.y) * 1.05],
      // type: "linear",
    },
    height: 200,
    showlegend: false,
    font: {
      // family: 'Courier New, monospace',
      family: "'Arial', sans-serif",
      size: 16,
      // color: '#7f7f7f'
    },
  };

  // Create new plot
  Plotly.newPlot("aqi-plot", traceData, layout);

  // Update current reading
  console.log(data.x);
  console.log(data.y);
  // let i = data.x.indexOf(Math.max(...data.x));
  var AQITime = data.x[data.x.length-1];
  var AQI = data.y[data.x.length-1];
  console.log(AQITime, AQI);

  var level = AQItoLevel(AQI)[0];
  var color = AQItoLevel(AQI)[1];
  var statement = AQItoLevel(AQI)[2];
  // console.log(AQItoLevel(AQI))

  var stationName = "Cicero2, Illinois, USA";
  d3.select(".aqi-location-time").text(`${stationName}, ${AQITime}`);
  d3.select(".aqi-value").text(AQI);
  d3.select(".aqi-level").text(level);
  d3.select(".aqi-statement").text(statement);
  d3.select(".aqi-banner").style("background-color", color);
  d3.select(".aqi-level").style("color", color);

})

// From AQI value to the corresponding color
function AQItoColor(AQI) {
  if (AQI<50) {
    var level = "Good";
    var color = "green";
  }
  else if (AQI<100) {
    var level = "Moderate";
    var color = "orange";
  }
  else if (AQI<150) {
    var level = "Unhealthy for Sensitive Groups";
    var color = "orange";
  }
  else if (AQI<200) {
    var level = "Unhealthy";
    var color = "red";
  }
  else if (AQI<300) {
    var level = "Very Unhealthy";
    var color = "purple";
  }
  else {
    var level = "Hazardous";
    var color = "darkred";
  }
  return [color, level]
}

function AQIstoColors(AQIArray) {
  var colors = [];
  var levels = [];
  AQIArray.forEach(AQI => {
    var color = AQItoColor(AQI)[0];
    var level = AQItoColor(AQI)[1];
    colors.push(color);
    levels.push(level)
  })
  return [colors, levels]
}