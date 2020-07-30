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
	    if ('error' in data){
		alert("This ETF either has too many holdings or our API key failed :(, so the ")
	    }
	    clear_graphs();
	    draw_graph(data["Ticker"] + ".csv", '2015', '2020')
	    compileETF(data, '2015', '2020');
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

function compileETF(etfDict, starter, ender) {
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
    draw_compiled_graph(result, starter, ender);
}



function draw_compiled_graph(data, year_start, year_end) {
    // set the dimensions and margins of the graph
    // console.log(getStartEndInds(data, year_start, year_end))
    var inds = getStartEndInds(data, year_start, year_end);
    // console.log(data);
    // console.log(Object.entries(data).slice(inds.start,inds.end));
    data = data.slice(inds.start,inds.end);
    // console.log(data)
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

    /* let tooltip = d3.select("body")
       .append("div")
       .attr("id","tooltip")
       .style("position","absolute")
       .style("font-family","Open-Sans', sans-serif")
       .style("font-size","12px")
       .style("z-index","10px")
       .style("visibility","hidden")
       .style("background-color","black")*/


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
	      }))/*
		   .on("mouseover",function(d){
		   d3.select("#tooltip")
		   .style("visibility","visible")
		   .html(d.date + ":" + d.value)
	    	   .style("color","#3affeb")
		   return
		   })

		   .on("mousemove",function(d){
		   d3.select("#tooltip")
	    	   .style("visibility","visible")
		   .style("top",(event.pageY-10) + "px")
		   .style("left",(event.pageX+10) + "px")
		   .text(x.invert( + ":" + d.value)
		   return
		   })
		   
		   .on("mouseout",function(d){
		   d3.select("#tooltip")
		   .style("visibility","hidden")
		   return
		   })*/
    // This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function(d) { return d.x; }).left;

    // Create the circle that travels along the curve of chart
    var focus = svg
	.append('g')
	.append('circle')
	.style("fill", "none")
	.attr("stroke", "black")
	.attr('r', 5)
	.style("opacity", 0)

    // Create the text that travels along the curve of chart
    var focusText = svg.append('g')
	.append('text')
	.style("opacity", 0)
	.attr("text-anchor", "left")
	.attr("alignment-baseline", "middle")

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    svg.append('rect')
	.style("fill", "none")
	.style("pointer-events", "all")
	.attr('width', width)
	.attr('height', height)
	.on('mouseover', mouseover)
	.on('mousemove', mousemove)
	.on('mouseout', mouseout);


    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
	focus.style("opacity", 1)
	focusText.style("opacity",1)
    }

    function mousemove() {
	// recover coordinate we need
	var x0 = x.invert(d3.mouse(this)[0]);
	var i = 0;
	while (data[i].date < x0){
	    i+=1;
	}
	let weight = 15;
	if (i > 150){
	    weight = -160;
	}
	selectedData = data[i]
	focus
	    .attr("cx", x(selectedData.date))
	    .attr("cy", y(selectedData.value))
	focusText
	    .html(String(selectedData.date).slice(0,15) + " : " + selectedData.value.toFixed(2))
	    .attr("x", x(selectedData.date)+weight)
	    .attr("y", y(selectedData.value))
    }
    function mouseout() {
	focus.style("opacity", 0)
	focusText.style("opacity", 0)
    }

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
	       var inds = getStartEndInds(data, year_start, year_end);
	       // console.log(data);
	       // console.log(Object.entries(data).slice(inds.start,inds.end));
	       data = data.slice(inds.start,inds.end);
	       // console.log(data);
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
	       // This allows to find the closest X index of the mouse:
	       var bisect = d3.bisector(function(d) { return d.x; }).left;

	       // Create the circle that travels along the curve of chart
	       var focus = svg
		   .append('g')
		   .append('circle')
		   .style("fill", "none")
		   .attr("stroke", "black")
		   .attr('r', 5)
		   .style("opacity", 0)

	       // Create the text that travels along the curve of chart
	       var focusText = svg.append('g')
		   .append('text')
		   .style("opacity", 0)
		   .attr("text-anchor", "left")
		   .attr("alignment-baseline", "middle")

	       // Create a rect on top of the svg area: this rectangle recovers mouse position
	       svg.append('rect')
		   .style("fill", "none")
		   .style("pointer-events", "all")
		   .attr('width', width)
		   .attr('height', height)
		   .on('mouseover', mouseover)
		   .on('mousemove', mousemove)
		   .on('mouseout', mouseout);


	       // What happens when the mouse move -> show the annotations at the right positions.
	       function mouseover() {
		   focus.style("opacity", 1)
		   focusText.style("opacity",1)
	       }

	       function mousemove() {
		   // recover coordinate we need
		   var x0 = x.invert(d3.mouse(this)[0]);
		   var i = 0;
		   while (data[i].date < x0){
		       i+=1;
		   }
		   selectedData = data[i]
		   let weight = 15;
		   if (i > 150){
		       weight = -160;
		   }
		   focus
		       .attr("cx", x(selectedData.date))
		       .attr("cy", y(selectedData.value))
		   focusText
		       .html(String(selectedData.date).slice(0,15) + " : " + parseFloat(selectedData.value).toFixed(2))
		       .attr("x", x(selectedData.date)+weight)
		       .attr("y", y(selectedData.value))
	       }
	       function mouseout() {
		   focus.style("opacity", 0)
		   focusText.style("opacity", 0)
	       }


	   })
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
