function draw_graph(element, dataset, dataset_2, year_start, year_end, first_render,r = "") {

  colors = ["red", "orange", "#CCCC00", "green", "blue", "violet"];

  const width = .8 * d3.select("#graph-container").node().getBoundingClientRect().width;
  const height = 300;
  const margin = 75;
  const parseYear = d3.timeParse("%Y");
  const parseTime = d3.timeParse("%Y-%m-%d");
  year_start = parseYear(year_start);
  year_end = parseYear(year_end);
  const scaleX = d3.scaleTime()
                  .range([0, width - (margin * 2)])
                  .domain([year_start, year_end]);
  const scaleY = d3.scaleLinear().range([height - margin, 0]);


  if (!first_render) {
    d3.select("#path" + r).remove();
    d3.select("#path2" + r).remove();
    d3.select("#y-axis" + r).remove();
    d3.select("#y-axis2" + r).remove();
    d3.select("#y-label" + r).remove();
    d3.select("#y-label2" + r).remove();

    d3.select("#x-axis" + r).remove();
    d3.select("#x-label" + r).remove();
  }

  if (dataset != 'none') {
    d3.csv("../static/csv/" + dataset + ".csv").then(function(raw_data) {
     data = []

     const date = raw_data.columns[0];
     const value = raw_data.columns[1];

     raw_data.forEach(function(d, index) {
       const current_year = parseTime(d[date]);
       if (d[value] != "." && current_year >= year_start && current_year <= year_end ) {

         d[value] = +d[value];
         d[date] = parseTime(d[date]);
         data.push(d);
       }
     });

     let domain_lower;
     let translate;
     if (d3.min(data, function(d) { return d[value]; }) < 0)
       domain_lower = d3.min(data, function(d) { return d[value]; })
     else
       domain_lower = 0;

     scaleY.domain([domain_lower, d3.max(data, function(d) { return d[value]; })]);

     let line = d3.line()
       .x(d => scaleX(d[date]))
       .y(d => scaleY(d[value]));

     color_1 = colors[Math.floor(Math.random()*3)];
     // draws line graph
     let line_path = element.append("path")
       .data([data])
       .attr("id", "path" + r)
       .attr("fill", "none")
       .attr("stroke", color_1)
       .attr("stroke-width", 1.5)
       .attr("d", line);

     let total_length = line_path.node().getTotalLength();

     line_path
       .attr("stroke-dasharray", total_length)
       .attr("stroke-dashoffset", total_length)
       .transition()
       .duration(2000)
       .attr("stroke-dashoffset", 0);

     // x and y axes
     element.append("g")
       .attr("id", "y-axis" + r)
       .call(d3.axisLeft(scaleY));
     element.append("text")
        .attr("transform", "rotate(-90)")
        .attr("id", "y-label" + r)
        .attr("y", 0 - margin)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .attr("fill", color_1)
        .style("text-anchor", "middle")
        .text(value);
   });
 }

 if (dataset_2 != 'none') {
   d3.csv("../static/csv/" + dataset_2 + ".csv").then(function(raw_data) {
     data = []

     const date = raw_data.columns[0];
     const value = raw_data.columns[1];

     raw_data.forEach(function(d, index) {
       const current_year = parseTime(d[date]);
       if (d[value] != "." && current_year >= year_start && current_year <= year_end ) {

         d[value] = +d[value];
         d[date] = parseTime(d[date]);
         data.push(d);
       }
     });

     let domain_lower;
     let translate;
     if (d3.min(data, function(d) { return d[value]; }) < 0)
       domain_lower = d3.min(data, function(d) { return d[value]; })
     else
       domain_lower = 0;

     scaleY.domain([domain_lower, d3.max(data, function(d) { return d[value]; })]);

     let line = d3.line()
       .x(d => scaleX(d[date]))
       .y(d => scaleY(d[value]));

     color_2 = colors[3 + Math.floor(Math.random()*3)];
     // draws line graph
     let line_path_2 = element.append("path")
       .data([data])
       .attr("id", "path2" + r)
       .attr("fill", "none")
       .attr("stroke", color_2)
       .attr("stroke-width", 1.5)
       .attr("d", line);

     let total_length_2 = line_path_2.node().getTotalLength();

     line_path_2
       .attr("stroke-dasharray", total_length_2)
       .attr("stroke-dashoffset", total_length_2)
       .transition()
       .duration(2000)
       .attr("stroke-dashoffset", 0);

     // x and y axes
     element.append("text")
        .attr("transform", "rotate(-90)")
        .attr("id", "y-label2" + r)
        .attr("y", width - margin - 20)
        .attr("x", - (height / 2))
        .attr("dy", "1em")
        .attr("fill", color_2)
        .style("text-anchor", "middle")
        .text(value);

     element.append("g")
       .attr("id", "y-axis2" + r)
       .attr('transform', 'translate(' + (width - (2 * margin))+ ',0)')
       .call(d3.axisRight(scaleY));
   });
 }
 // console.log('removing x axis');
 // d3.select("#x-axis" + r).remove();
 // d3.select("#x-label" + r).remove();
 //
 // console.log('adding x axis');
 element.append("g")
   .attr("id", "x-axis" + r)
   .attr('transform', 'translate(0,' + (height - margin) + ')')
   .call(d3.axisBottom(scaleX));
 element.append("text")
   .attr("transform", "translate(" + (width/2 - margin)+ "," + height + ")")
   .attr("id", "x-label" + r)
   .style("text-anchor", "middle")
   .text("Year");
}
