// const createCsvWriter = require('node_modules/csv-writer').createObjectCsvWriter;
// let parser = d3.
// var ratio;

let data = {
  "ETF": "SOXX"
}

var userETF = document.getElementById("pickETF");
userETF.addEventListener("change", function() {
  console.log(userETF.value);
  data.ETF = userETF.value;
  console.log(data);
  fetch("/getetfdata", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => res.json())
    .then(data => {
      console.log(data);
      converted = data;
      clear_graphs();
      draw_graph(data["Ticker"] + ".csv", '2015-01-02', '2020-01-03')
      compileETF(data)
      document.getElementById("title0").innerHTML = "Currently Displaying " + data["Ticker"] + " data from past 5 years";
      document.getElementById("title1").innerHTML = "Displaying graph of " + data["Ticker"] + " made up of its parts";
      document.getElementById("label0").innerHTML = "This graph depicts the price history of " + data["Ticker"] + " over the past 5 years";
      document.getElementById("label1").innerHTML = "These results are about " + data['excludedWeight'].toFixed(3) + "% off because some historical data for the holdings was unavailable";
      document.getElementById("holding").innerHTML = "List of holdings included for " + data['Ticker'];
      let listHoldings = document.getElementById("listholdings");
      while (listHoldings.firstChild) {
        listHoldings.removeChild(listHoldings.lastChild);
      }
      for (holding in data['holdings']) {
        let r = document.createElement("li");
        r.classList.add("list-group-item");
        let div0 = document.createElement("div");
        div0.classList.add('row');
        let div1 = document.createElement("div");
        div1.classList.add('col-8');
        let para0 = document.createElement("p");
        para0.innerHTML = holding;
        div1.appendChild(para0);

        let span0 = document.createElement("span");
        span0.classList.add('border');

        let div2 = document.createElement("div");
        div2.classList.add('col-2');

        let orgTool = document.createElement("div");
        orgTool.classList.add('row')

        let innerC1 = document.createElement("div");
        innerC1.classList.add('col');
        let wInput = document.createElement("input");
        wInput.classList.add('form-control');
        wInput.classList.add('w-100');
        wInput.value = data['holdings'][holding]['Weight'].toFixed(3).toString();
        innerC1.appendChild(wInput);
        orgTool.appendChild(innerC1);

        let innerC2 = document.createElement("div");
        innerC2.classList.add("col-1");
        innerC2.innerHTML = "<p>%</p>";
        orgTool.appendChild(innerC2);


        // let para1 = document.createElement("p");
        // para1.classList.add('mx-auto');
        // para1.innerHTML = data['holdings'][holding]['Weight'].toFixed(3).toString() + "%";
        div2.appendChild(orgTool);
        div0.appendChild(div1);
        div0.appendChild(span0);
        div0.appendChild(div2);
        r.appendChild(div0);
        listHoldings.appendChild(r);
      }


      //window.location = "/" + data.redirect;
    })
})

function compileETF(etfDict) {
  var ratio = parseFloat(etfDict['startVal']);
  var holdings = etfDict['holdings'];
  var excludedWeight = etfDict['excludedWeight'];
  var ticker = etfDict['Ticker'];
  var holdingTickers = Object.keys(holdings);
  var result = [];
  // var ratio = 0;
  // console.log(ratio);

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
        var holdingSum = 0
        if (holdings[holding]['Weight'] != 0 && holdings[holding]['data'].length >2) {
          if (((holdings[holding]['data'].length < etfDict['points']) && (date > (lenDiff)))) {

            holdingSum = holdings[holding]['data'][date - lenDiff][1] * weight / 100;

            // if (!holdingSum) {
            //   console.log(holding);
            //   console.log(weight);
            //   console.log(holdings[holding]['data']);
            //   console.log(holdings[holding]['Weight']);
            // }
            // console.log(sumForDay);
          } else if (!(holdings[holding]['data'].length < etfDict['points'])) {
            holdingSum = holdings[holding]['data'][date][1] * weight / 100;

            // if (!holdingSum) {
            //   console.log(holding);
            //   console.log(weight);
            //   console.log(holdings[holding]['data']);
            //   console.log(holdings[holding]['Weight']);
            // }
            // console.log(sumForDay);
          }
          sumForDay += holdingSum;
        }
        // sumForDay +=
      }
      // console.log(sumForDay);
      // result[x] = {}
      // console.log(holdings[holdingTickers[0]]['data'][date])
      var realDate = d3.timeParse("%Y-%m-%d")(holdings[holdingTickers[0]]['data'][date][0]);
      // console.log(realDate);
      if (date == 1) {
        ratio = ratio / sumForDay;
        // console.log(sumForDay);
        // console.log(ratio);
      }
      sumForDay *= ratio;
      var parsable = {
        date: realDate,
        value: sumForDay
      };
      result.push(parsable);
      // result[d3.timeParse("%Y-%m-%d")(holdings[holdingTickers[0]]['data'][date])] = sumForDay;
      // /console.log(date[0])
    }
    x++;
  }
  // console.log(result);
  draw_compiled_graph(result, 10, 10);
}



function draw_compiled_graph(data, year_start, year_end) {
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
      data = data.filter(function(cValue){
        return cValue.date != null;
      });
      console.log(data);
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

function clear_graphs() {
  const graph = document.getElementById("graph1");
  while (graph.firstChild) {
    graph.removeChild(graph.lastChild);
  }
  const graph2 = document.getElementById("graph2");
  while (graph2.firstChild) {
    graph2.removeChild(graph2.lastChild);
  }

}
