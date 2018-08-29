// Return the datetime range for the past hour from the given datetime
function datetimeRange(currentdate) {
    currentdate.setHours(currentdate.getHours() - 1);
    var d1 = datetimeString(parseDatetime(currentdate));
    currentdate.setHours(currentdate.getHours() + 1);
    var d2 = datetimeString(parseDatetime(currentdate));
    var datetime1Hour = [d1, d2];
    return datetime1Hour
}
  
// Format datetime into query datetime string
function datetimeString([year, month, date, hour, minute, second]) {
    return `'${year}-${month}-${date}T${hour}:${minute}:${second}'`
}
  
// Parse datetime into year, month, ..., second
function parseDatetime(currentdate) {
    var year = currentdate.getFullYear();
    var month = formatDate(currentdate.getMonth()+1);
    var date = formatDate(currentdate.getDate());
    var hour = formatDate(currentdate.getHours());
    var minute = formatDate(currentdate.getMinutes());
    var second = formatDate(currentdate.getSeconds());
    return [year, month, date, hour, minute, second]
}
  
// Format integer into 2-digit string
function formatDate(date) {
  if (date<10) {
    return `0${date}`
  }
  else {
    return `${date}`
  }
}

// Function that calculates mean value of a list
function mean(list) {
    var sum = 0;
    for (var i = 0; i < list.length; i++) {
      sum += list[i];
    }
    return sum / list.length;
  }
  
  // Function that determines color of traffic segment based on speed
  function chooseColor(data) {
      var speed = data.avg_speed;
      if (speed < 15 && speed >= 0) {
          var color = "red";
      }
      else if (speed < 25 && speed >= 0) {
          var color = "yellow";
      }
      else {
          var color = "green";
      }
      return color;
  }
  
  // Function that calculates median
  function median(values){
      values.sort(function(a,b){
      return a-b;
    });
  
    if(values.length ===0) return 0
  
    var half = Math.floor(values.length / 2);
  
    if (values.length % 2)
      return values[half];
    else
      return (values[half - 1] + values[half]) / 2.0;
  }

// Generate query URL to query hourly data (aggregated over the past hour) based on a given datetime
function generateURL(baseURL, datetimeX) {
    var URL = `${baseURL}$where=time between ${datetimeX[0]} and ${datetimeX[1]} and speed>0&$select=avg(start_latitude),avg(start_longitude),avg(end_latitude),avg(end_longitude),avg(speed),segment_id,sum(bus_count)&$group=segment_id&$limit=1500`;
    return URL
}
// Query URLs
// https://dev.socrata.com/docs/queries/
// https://dev.socrata.com/docs/datatypes/number.html#2.1,

// var hour = 17;
// var month = 7;
// var day_of_week = 4;
// var URL = `${baseURL}$where=hour = ${hour}&month=${month}&day_of_week=${day_of_week}&$select=avg(start_latitude),avg(start_longitude),avg(end_latitude),avg(end_longitude),avg(speed),segment_id,sum(bus_count)&$group=segment_id&$limit=1500`;

// Clean traffic data
function cleanTraffic(trafficData) {
  var speeds = [];
  trafficData.forEach(function(data) {
    data.avg_start_latitude = +data.avg_start_latitude;
    data.avg_start_longitude = +data.avg_start_longitude;
    data.avg_end_latitude = +data.avg_end_latitude;
    data.avg_end_longitude = +data.avg_end_longitude;
    data.avg_speed = +data.avg_speed;
    speeds.push(data.avg_speed)
    data.sum_bus_count = +data.sum_bus_count;

    var startCoordinates = [data.avg_start_latitude, data.avg_start_longitude];
    var endCoordinates = [data.avg_end_latitude, data.avg_end_longitude];
    var coordinates = [startCoordinates, endCoordinates];
    data.coordinates = coordinates;
  });
  return trafficData, speeds
}

// Generate polylines from cleaned traffic data
function generatePolyline(trafficData, timeString) {
  var polylines = [];
  trafficData.forEach(function(data) {
      var latlngs = data.coordinates;
      var polyline = L.polyline(latlngs, {
          time: timeString.slice(1,-1),
          color: chooseColor(data)
      });
      polylines.push(polyline)
  })
  return polylines
}

// Recursive query until condition is met
function nextQuery(currentdate) {
  // console.log(currentdate);
  var datetimeNow = datetimeRange(currentdate);
  // console.log(datetimeNow);
  var URL = generateURL(baseURL, datetimeNow);
  d3.json(URL).then(function(trafficData) {
    console.log(URL);
    // console.log(trafficData);
    if (trafficData === null || trafficData.length === 0) {
      currentdate.setHours(currentdate.getHours() - 1);
      return nextQuery(currentdate)
    }
    else {
      return currentdate
    }
  })
}

// From AQI value to the corresponding colored marker
function AQItoColoredMarker(AQI) {
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

  // Creates a marker with awesome markers
  var myMarker = L.AwesomeMarkers.icon({
    icon: 'info-circle',
    prefix: 'fa',
    markerColor: color,
  });
  return myMarker
}