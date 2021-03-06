var state  = "apart";

doubleGraph(converted['Ticker'], compileETF(converted), '2015', '2020');

function doubleGraph(dataset1, dataset2, year_start, year_end){
  // set the dimensions and margins of the graph
  var margin = {
top: 10,
right: 30,
bottom: 30,
left: 30
  },
width = 700 - margin.left - margin.right,
height = 300 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#graph-container")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  d3.csv("static/csv/" + dataset1 + ".csv",

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
       var inds1 = getStartEndInds(data, year_start, year_end);
       var inds2 = getStartEndInds(dataset2, year_start, year_end);
       // console.log(data);
       // console.log(Object.entries(data).slice(inds.start,inds.end));
       data = data.slice(inds1.start,inds1.end);
       dataset2 = dataset2.slice(inds2.start,inds2.end);
       // console.log(data);
       // Add X axis --> it is a date format
       console.log(data);
       console.log(dataset2);

       var x = d3.scaleTime()
     .domain(d3.extent(data, function(d) {
         return d.date;
     }))
     .range([0, width]);
       svg.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x));

     var maxler = d3.max(data, function(d) {
         return +d.value;
     });
     var maxler2 = d3.max(dataset2, function(d) {
         return +d.value;
     });
     var realMax = d3.max([maxler, maxler2], function(d) {
         return +d;
     });
     console.log(maxler);
     console.log(maxler2);
     console.log(realMax);

       // Add Y axis
       var y = d3.scaleLinear()
     .domain([0, realMax])
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


    svg.append("path")
  .datum(dataset2)
  .attr("fill", "none")
  .attr("stroke", "red")
  .attr("stroke-width", 1.5)
  .attr("d", d3.line()
  .x(function(d) {
      return x(d.date)
  })
  .y(function(d) {
      return y(d.value)
  })
)
   //     // This allows to find the closest X index of the mouse:
   //     var bisect = d3.bisector(function(d) { return d.x; }).left;
   //
   //     // Create the circle that travels along the curve of chart
   //     var focus = svg
   //   .append('g')
   //   .append('circle')
   //   .style("fill", "none")
   //   .attr("stroke", "black")
   //   .attr('r', 5)
   //   .style("opacity", 0)
   //
   //     // Create the text that travels along the curve of chart
   //     var focusText = svg.append('g')
   //   .append('text')
   //   .style("opacity", 0)
   //   .attr("text-anchor", "left")
   //   .attr("alignment-baseline", "middle")
   //
   //     // Create a rect on top of the svg area: this rectangle recovers mouse position
   //     svg.append('rect')
   //   .style("fill", "none")
   //   .style("pointer-events", "all")
   //   .attr('width', width)
   //   .attr('height', height)
   //   .on('mouseover', mouseover)
   //   .on('mousemove', mousemove)
   //   .on('mouseout', mouseout);
   //
   //
   //     // What happens when the mouse move -> show the annotations at the right positions.
   //     function mouseover() {
   //   focus.style("opacity", 1)
   //   focusText.style("opacity",1)
   //     }
   //
   //     function mousemove() {
   //   // recover coordinate we need
   //   var x0 = x.invert(d3.mouse(this)[0]);
   //   console.log(x0)
   //   var i = 0;
   //   while (data[i].date < x0){
   //       //console.log(data[i].date);
   //       i+=1;
   //   }
   //   selectedData = data[i]
   //   console.log(selectedData);
   //   let weight = 15;
   //   if (i > 150){
   //       weight = -160;
   //   }
   //   focus
   //       .attr("cx", x(selectedData.date))
   //       .attr("cy", y(selectedData.value))
   //   focusText
   //       .html(String(selectedData.date).slice(0,15) + " : " + parseFloat(selectedData.value).toFixed(2))
   //       .attr("x", x(selectedData.date)+weight)
   //       .attr("y", y(selectedData.value))
   //     }
   //     function mouseout() {
   //   focus.style("opacity", 0)
   //   focusText.style("opacity", 0)
   //     }
   //
   //
   // })
})}

function toggleGraph(){
  var button = document.getElementById('toggleButton');
  if (state == "together"){
    // var coupled = d3.select('#single-card')
    // coupled.style("display", "none");
    // var disconnected = d3.select('#dual-cards');
    // diconnected.style("display",'');
    var coupled = document.getElementById('single-cardler');
    coupled.style.display = "none";
    var decoupled = document.getElementById('dual-cards');
    decoupled.style.display = "";
    state = "apart";
    button.innerHTML = "Show Graphed Together";
  } else{
    var decoupled = document.getElementById('dual-cards');
    decoupled.style.display = "none";
    var coupled = document.getElementById('single-cardler');
    coupled.style.display = "";
    state = "together";
    button.innerHTML = "Show Graphed Apart";
  }
}
