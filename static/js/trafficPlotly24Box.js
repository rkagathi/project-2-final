// Traffic by region in the past 24 hours
var baseURL = "https://data.cityofchicago.org/resource/kf7e-cur8.json?";
var currentdate = new Date();
var datetimeX = datetimeRange1Day(currentdate);
var URL = generateURL1Day(baseURL, datetimeX);
// console.log(URL);

d3.json(URL).then(function(data) {
  data = cleanTrafficRegion(data);
  // console.log(data);

  var speeds = {};
  var times = [];
  data.forEach(entry => {
    if (entry.time in speeds) {
      speeds[entry.time] = speeds[entry.time].concat(entry.speed);
    }
    else {
      speeds[entry.time] = [entry.speed];
      times.push(entry.time);
    }
  })

  var traceData = [];
  var avgSpeed = [];
  var medSpeed = [];
  Object.keys(speeds).forEach(key => {

    // Calculate average and median speed at each timestamp
    avgSpeed.push(mean(speeds[key]));
    medSpeed.push(median(speeds[key]));

    // Create a box trace
    var tracerX = {
      name: key,
      y: speeds[key],
      type: "box",
      marker: {
        color: '#3D9970',
        color: 'rgb(8,81,156)',
      },
      boxpoints: false,
    };

    // Plotly data
    traceData.push(tracerX);
  });

  // Add a scatter trace for median speed
  var tracerMed = {
    x: times,
    y: medSpeed,
    type: "scatter",
    name: "median",
    // mode: 'lines+markers',
    mode: "markers",
    // mode: "lines",
    marker: {
      color: "#2077b4",
      color: 'rgb(107,174,214)',
      symbol: "hexagram",
      size: 0,
    },
    // line: {
    //   color: "#17BECF"
    // }
  };
  traceData.push(tracerMed);

  // Add a scatter trace for mean speed
  var tracerAvg = {
    x: times,
    y: avgSpeed,
    type: "scatter",
    name: "average",
    // mode: 'lines+markers',
    mode: "markers",
    // mode: "lines",
    marker: {
      color: "#2077b4",
      color: 'rgb(9,56,125)',
      symbol: "hexagram"
    },
    // line: {
    //   color: "#17BECF"
    // }
  };
  traceData.push(tracerAvg);

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
      title: "Traffic Speed (MPH)",
      autorange: true,
      type: "linear",
    },
    height: 250,
    showlegend: false,
    font: {
      // family: 'Courier New, monospace',
      family: "'Arial', sans-serif",
      size: 16,
      // color: '#7f7f7f'
    },
  };

  // Create new plot
  Plotly.newPlot("plot", traceData, layout);

})


// Generate query URL to query hourly data (aggregated over the past hour) based on a given datetime
function generateURL1Day(baseURL, datetimeX) {
  var URL = `${baseURL}$where=time between ${datetimeX[0]} and ${datetimeX[1]} and speed>0&$limit=4000`;
  return URL
}

// Return the datetime range for the past hour from the given datetime
function datetimeRange1Day(currentdate) {
  currentdate.setHours(currentdate.getHours() - 24);
  var d1 = datetimeString(parseDatetime(currentdate));
  currentdate.setHours(currentdate.getHours() + 24);
  var d2 = datetimeString(parseDatetime(currentdate));
  var datetime1Hour = [d1, d2];
  return datetime1Hour
}

// Clean traffic data
function cleanTrafficRegion(trafficData) {
  trafficData.forEach(function(data) {
    data.bus_count = +data.bus_count;
    data.speed = +data.speed;
    data.num_reads = +data.num_reads;
    data.region_id = +data.region_id;
  });
  return trafficData
}