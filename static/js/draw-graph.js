// const createCsvWriter = require('node_modules/csv-writer').createObjectCsvWriter;
// let parser = d3.
// var ratio;


function compileETF(etfDict) {
  var ratio = parseFloat(etfDict['startVal']);
  var holdings = etfDict['holdings'];
  var excludedWeight = etfDict['excludedWeight'];
  var ticker = etfDict['Ticker'];
  var holdingTickers = Object.keys(holdings);
  var result = [];
  // var ratio = 0;

  var x = 0;
  // var sumWeights = 0;
  for (date in holdings[holdingTickers[0]]['data']) {
    var sumForDay = 0;
    if (date > 0) {
      var z = 0;
      for (holding in holdings) {
        //console.log(holdings[holding]['data'][date]);

        var weight = holdings[holding]['Weight'];
        var lenDiff = etfDict['points'] - holdings[holding]['data'].length
        if (((holdings[holding]['data'].length < etfDict['points']) && (date > (lenDiff)))) {
          sumForDay += holdings[holding]['data'][date - lenDiff][1] * weight / 100;
        } else if (!(holdings[holding]['data'].length < etfDict['points'])){
            sumForDay += holdings[holding]['data'][date][1] * weight / 100;
        }
        // sumForDay +=
      }
      // result[x] = {}
      // console.log(holdings[holdingTickers[0]]['data'][date])
      var realDate = d3.timeParse("%Y-%m-%d")(holdings[holdingTickers[0]]['data'][date][0]);
      // console.log(realDate);
      if (date == 1){
        ratio = ratio / sumForDay;
        console.log(ratio)
      }
      sumForDay *= ratio;
      var parsable = {date:realDate, value:sumForDay};
      result.push(parsable);
      // result[d3.timeParse("%Y-%m-%d")(holdings[holdingTickers[0]]['data'][date])] = sumForDay;
      // /console.log(date[0])
    }
    x++;
  }
  // console.log(result);
  draw_compiled_graph(result, 10,10);
}



function draw_compiled_graph(data, year_start, year_end){
  // set the dimensions and margins of the graph
  console.log(data);
  var margin = {
      top: 10,
      right: 30,
      bottom: 30,
      left: 30
    },
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#graph2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

      // console.log(data)
    // function(data) {
      // Add X axis --> it is a date format
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) {
          return d.date;
        }))
        .range([0, width]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
          return +d.value;
        })])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Add the line
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) {
            return x(d.date)
          })
          .y(function(d) {
            return y(d.value)
          })
        )
}




function draw_graph(dataset, year_start, year_end) {

  // set the dimensions and margins of the graph
  var margin = {
      top: 10,
      right: 30,
      bottom: 30,
      left: 30
    },
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#graph1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  d3.csv("static/csv/" + dataset,

    // When reading the csv, I must format variables:
    function(d) {
      return {
        date: d3.timeParse("%Y-%m-%d")(d.date),
        value: d.value
      }
    },

    // Now I can use this dataset:
    function(data) {
      // ratio = data[0].value;
      // console.log(ratio);

      // Add X axis --> it is a date format
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) {
          return d.date;
        }))
        .range([0, width]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
          return +d.value;
        })])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Add the line
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) {
            return x(d.date)
          })
          .y(function(d) {
            return y(d.value)
          })
        )

    })
    // console.log(ratio);
    // return ratio;
}
