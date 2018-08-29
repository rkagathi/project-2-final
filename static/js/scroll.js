var bdate = "20180601"
var edate = "20180630"

var pmurl = `https://cors-anywhere.herokuapp.com/https://aqs.epa.gov/api/rawData?user=thomas.e.abraham@gmail.com&pw=khakiosprey52&format=AQCSV&param=81102&bdate=${bdate}&edate=${edate}&state=17&county=031`
var ozurl = `https://cors-anywhere.herokuapp.com/https://aqs.epa.gov/api/rawData?user=thomas.e.abraham@gmail.com&pw=khakiosprey52&format=AQCSV&param=44201&bdate=${bdate}&edate=${edate}&state=17&county=031`
var courl = `https://cors-anywhere.herokuapp.com/https://aqs.epa.gov/api/rawData?user=thomas.e.abraham@gmail.com&pw=khakiosprey52&format=AQCSV&param=42101&bdate=${bdate}&edate=${edate}&state=17&county=031`
var sourl = `https://cors-anywhere.herokuapp.com/https://aqs.epa.gov/api/rawData?user=thomas.e.abraham@gmail.com&pw=khakiosprey52&format=AQCSV&param=42401&bdate=${bdate}&edate=${edate}&state=17&county=031`
var nourl = `https://cors-anywhere.herokuapp.com/https://aqs.epa.gov/api/rawData?user=thomas.e.abraham@gmail.com&pw=khakiosprey52&format=AQCSV&param=42602&bdate=${bdate}&edate=${edate}&state=17&county=031`
// Set up our chart
var svgWidth = 1011;
var svgHeight = 777;
var margin = { top: 30, right: 40, bottom: 100, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var parseTime = d3.timeParse("%Y%m%dT%H%M-%S%L")


function go(bdate, edate){
d3.csv(pmurl).then(data1 => {
    d3.csv(ozurl).then(data2 => {
        d3.csv(courl).then(data3 => {
            d3.csv(sourl).then(data4 => {
                d3.csv(nourl).then(data5 => {        
                    
                    var pemdata = data1
                    var o3data = data2
                    var codata = data3
                    var so2data = data4
                    var no2data = data5
                    var alldata = d3.merge([data1,data2,data3,data4,data5])

                    // Zoom Function 
                    function zoomFunction(){
                        // create new scale ojects based on event
                        var new_xScale = d3.event.transform.rescaleX(xScale)
                        var new_yScale = d3.event.transform.rescaleY(yScale)
                        console.log(d3.event.transform)
                        
                        // update axes
                        gX.call(xAxis.scale(new_xScale));
                        gY.call(yAxis.scale(new_yScale));
                        
                        // update circle
                        circles.attr("transform", d3.event.transform)
                        };
                    

                    var zoom = d3.zoom()
                        .on("zoom", zoomFunction);

                    // Create an SVG wrapper, append an svg that will hold our chart and shift the latter by left and top margins
                    var svg = d3.select("#chart")
                        .append("svg")
                        .attr("height", svgHeight)
                        .attr("width", svgWidth)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);


                    var chart = svg.append("g")
                        .call(zoom);

                    // Initialize tooltip
                    var toolTip = d3.tip()
                        .attr("class", "tooltip")
                        .html(function(alldata) {
                            var datetime = parseTime(alldata.datetime)
                            var value = +alldata.value;
                            var units = alldata.units;
                            if (alldata.parameter==="81102"){return (`PM10 Measures ${value} Micrograms Per Cubic Meter<hr>${datetime}`)}
                            else if (alldata.parameter==="44201"){return (`Ozone Measures ${value} Parts Per Million<hr>${datetime}`)}
                            else if (alldata.parameter==="42101"){return (`CO Measures ${value} Parts Per Million<hr>${datetime}`)}
                            else if (alldata.parameter==="42401"){return (`SO2 Measures ${value} Parts Per Billion<hr>${datetime}`)}
                            else if (alldata.parameter==="42602"){return (`NO2 Measures ${value} Parts Per Billion<hr>${datetime}`)}
                    });
                
                    // Create tooltip
                    chart.call(toolTip);
                
                
                    // define scale functions(range)
                    var xScale = d3.scaleTime().range([0, width]);
                    var yScale = d3.scaleLinear().range([height, 0]);
                
                    // define axis functions
                    var xAxis = d3.axisBottom(xScale);
                    var yAxis = d3.axisLeft(yScale);
                
                    // these variables store the min and max values in a column in data.csv
                    var xRan;
                    var yMin;
                    var yMax;
                    
                    // create a function to identify min, max values of a column in data.csv which in turn
                    // assigns the results to the variables created above
                    function findMinAndMax(data) {
                        xRan = d3.extent(data, function (d) { return parseTime(d["datetime"])});
                        yMin = d3.min(data, function (d) { return d["value"] * 0.8 });
                        yMax = d3.max(data, function (d) { return d["value"] * 1.2 });
                    };
                    
                    // set the default x-axis
                    var defaultAxisLabelX = "datetime"
                
                    // set the default y-axis
                    var defaultAxisLabelY = "PM10"
                
                    // call the findMinAndMax() on the default X Axis
                    findMinAndMax(alldata) 
                
                    // set the domain of the axes
                    xScale.domain(xRan);
                    yScale.domain([yMin, yMax])

                    //All of the "official" pollutants in our Solar System
                    var pollutants = [
                        {pollutant: "81102", color: '#a50f15'},
                        {pollutant: "42101", color: '#006d2c'},
                        {pollutant: "44201", color: '#08519c'},
                        {pollutant: "42401", color: '#d94801'},
                        {pollutant: "42602", color: '#ffeda0'},
                        {pollutant: "all", color: '#54278f'}
                    ];

                    var pollutantGradients = svg.append("defs").selectAll("radialGradient")
                        .data(pollutants)
                        .enter().append("radialGradient")
                        //Create a unique id per "pollutant"
                        .attr("id", function(d){return d.pollutant;})
                        .attr("cx", "35%") //Move the x-center location towards the left
                        .attr("cy", "35%") //Move the y-center location towards the top
                        .attr("r", "60%"); //Increase the size of the "spread" of the gradient

                    //Add colors to the gradient
                    //First a lighter color in the center
                    pollutantGradients.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", function(d) {
                        return d3.rgb(d.color).brighter(1);
                    });

                    //Then the actual color almost halfway
                    pollutantGradients.append("stop")
                    .attr("offset", "50%")
                    .attr("stop-color", function(d) {
                        return d.color;
                    });

                    //Finally a darker color at the outside
                    pollutantGradients.append("stop")
                    .attr("offset",  "100%")
                    .attr("stop-color", function(d) {
                        return d3.rgb(d.color).darker(1.75);
                    });


                    // create chart
                    var view = chart.append("rect")
                        .attr("class", "zoom")
                        .attr("width", width)
                        .attr("height", height)
                        .call(zoom)


                    var circles = chart.selectAll("circle")
                        .data(alldata)
                        .enter()
                        .append("circle")
                        .attr("id","circles")
                        .attr("cx", function (d) {
                            return xScale(parseTime(d["datetime"]));
                        })
                        .attr("cy", function (d) {
                            return yScale(d["value"]);
                        })
                        .attr("r", 5)
                        .attr("fill", "url(#all)")
                        .attr("opacity", 1)
                        // display tooltip on click
                        .on("mouseover", function (d) {
                            toolTip.show(d);
                        })
                        // hide tooltip on mouseout
                        .on("mouseout", function (d) {
                            toolTip.hide(d);
                        })
                
                
                    // create x-axis
                    var gX = chart.append("g")
                        .attr("class", "x-axis")
                        .attr("transform", `translate(0,${height})`)
                        .call(xAxis);
                
                    // create y-axis
                    var gY = chart.append("g")
                        .attr("class", "y-axis")
                        .attr("transform", `translate(-10,0)`)
                        .call(yAxis)

                    
                
                    

                    // add x-axis titles
                    chart.append("text")
                        .attr("transform", `translate(${width / 2},${height + 40})`)
                        // This axis label is active by default
                        .attr("class", "axis-text-x active")
                        .attr("data-axis-name", "datetime")
                        .text("Time");
                
                
                
                    // add y-axis titles 
                    chart.append("text")
                        .attr("transform", `translate(-40,180)rotate(270)`)
                        .attr("id",'PM10')
                        .attr("class", "axis-text-y inactive")
                        .attr("data-axis-name", 'PM10')
                        .text("PM10 Total 0-10um");
                
                
                    chart.append("text")
                        .attr("transform", `translate(-40,330)rotate(270)`)
                        .attr("id",'O3')
                        .attr("class", "axis-text-y inactive")
                        .attr("data-axis-name", 'O3')
                        .text("Ozone");
                
                
                    chart.append("text")
                        .attr("transform", `translate(-40,480)rotate(270)`)
                        .attr("id",'CO')
                        .attr("class", "axis-text-y inactive")
                        .attr("data-axis-name", 'CO')
                        .text("Carbon Monoxide");
                    
                    chart.append("text")
                        .attr("transform", `translate(-70,255)rotate(270)`)
                        .attr("id",'SO2')
                        .attr("class", "axis-text-y inactive")
                        .attr("data-axis-name", 'SO2')
                        .text("Sulfur Dioxide");

                    chart.append("text")
                        .attr("transform", `translate(-70,405)rotate(270)`)
                        .attr("id",'NO2')
                        .attr("class", "axis-text-y inactive")
                        .attr("data-axis-name", 'NO2')
                        .text("Nitrogen Dioxide");
                
                    // active-inactive toggle x axis
                    function labelChangeX(clickedAxis) {
                        d3.selectAll(".axis-text-x")
                            .filter(".active")
                            .classed("active", false)
                            .classed("inactive", true);
                
                        clickedAxis.classed("inactive", false).classed("active", true);
                    }
                
                    // active-inactive toggle y axis
                    function labelChangeY(clickedAxis) {
                        d3.selectAll(".axis-text-y")
                            .filter(".active")
                            .classed("active", false)
                            .classed("inactive", true);
                
                        clickedAxis.classed("inactive", false).classed("active", true);
                    }
                
                
                    // On click events for the y-axis
                    d3.selectAll(".axis-text-y").on("click", function () {
                
                        // assign the variable to the current axis
                        var clickedSelection = d3.select(this);
                        var isClickedSelectionInactive = clickedSelection.classed("inactive");
                        console.log("this axis is inactive", isClickedSelectionInactive)
                        var clickedAxis = clickedSelection.attr("data-axis-name");
                        console.log("current axis: ", clickedAxis);
                
                        if (isClickedSelectionInactive) {
                            
                            currentAxisLabelY = clickedAxis;


                            if (currentAxisLabelY==='O3'){currentAxisLabelY=o3data;}
                            else if (currentAxisLabelY==='CO'){currentAxisLabelY=codata;}
                            else if (currentAxisLabelY==='PM10'){currentAxisLabelY=pemdata;}
                            else if (currentAxisLabelY==='SO2'){currentAxisLabelY=so2data;}
                            else if (currentAxisLabelY==='NO2'){currentAxisLabelY=no2data;}
                            else (currentAxisLabelY=alldata)

                            findMinAndMax(currentAxisLabelY);
                
                            yScale.domain([yMin, yMax]);
                
                            // create y-axis
                            svg.select(".y-axis")
                                .transition()
                                .duration(1000)
                                .ease(d3.easeLinear)
                                .call(yAxis);


                            d3.selectAll("circle")
                                .transition()
                                .duration(1000)
                                .ease(d3.easeLinear)
                                .on("start", function () {
                                    d3.select(this)
                                        .attr("r", 5)
                                        .attr("fill", function(d) {
                                            return `url(#${d["parameter"]})`;
                                        })
                                        .attr("opacity", 1);
                
                                })
                                .attr("cx", function (d) {
                                    return xScale(parseTime(d["datetime"]));
                                })
                                .attr("cy", function (d) {
                                    return yScale(d["value"]);
                                })
                                .on("end", function () {
                                    d3.select(this)
                                        .transition()
                                        .duration(1000)
                                        .attr("r", 5)
                                        .attr("fill", function(d) {
                                            return `url(#${d["parameter"]})`;
                                        })
                                        .attr("opacity", 1);
                                })
                
                
                            labelChangeY(clickedSelection);
                
                        }
                
                    });
                })
            })
        })
    })
}) // this works!
};

go();
