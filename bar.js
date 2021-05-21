d3.csv("../data/bar_data.csv", d3.autoType).then(data => {
    console.log(data);
  

    /** CONSTANTS */
    // constants help us reference the same values throughout our code
    const width = window.innerWidth * .75,
      height = window.innerHeight / 2,
      paddingInner = 0.2,
      margin = { top: 20, bottom: 40, left: 100, right: 100 }

    /** SCALES */
    // reference for d3.scales: https://github.com/d3/d3-scale
    
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgMedList)])
      .range([width - margin.left, margin.right]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.Year))
      .range([height - margin.bottom, margin.top])
      .paddingInner(paddingInner);
    
    /** DRAWING ELEMENTS */
    const svg = d3.select("#barchart-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

 // reference for d3.axis: https://github.com/d3/d3-axis
 const yAxis = d3.axisLeft(yScale).ticks(data.length);

const color = d3.scaleSequential()
    .domain([-8, d3.max(data, d => d.AvgMedList)])
    .interpolator(d3.interpolateYlOrRd)

    // draw rects
    const rect = svg.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", 0, d => xScale(d.AvgMedList))
      .attr("y", d => yScale(d.Year))
      .attr("height", yScale.bandwidth())
      .attr("width", d => width - margin.left - xScale(d.AvgMedList))
      .attr("transform", `translate(200, ${height - margin.bottom, margin.top})`)
      .attr("fill", d=>color(d.AvgMedList));
      // .attr("width", function(d) { return width - margin.left - xScale(0)})
      // .attr("x", function(d) {return xScale(0)});



    // Animation  from https://www.d3-graph-gallery.com/graph/barplot_animation_start.html
      // svg.selectAll("rect")
      // .transition()
      // .duration(800)
      // .attr("x", function(d) { return xScale(d.Percent); })
      // .attr("width", function(d) { return width - margin.left - xScale(d.Percent); })
      // .delay(function(d,i){console.log(i) ; return(i*100)})
        
    // append text
    const text = svg
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("class", "label")
      // this allows us to position the text in the center of the bar
      .attr("y", d => yScale(d.Year) + (yScale.bandwidth()+5))
      .attr("x", 0, d => xScale(d.AvgMedList))
      .text(d => `$${d.AvgMedList} USD`)
      .attr("dx", "205")
      .attr("fill", "#ffffff");
 
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(190, ${height - margin.bottom, margin.top})`)
      .call(yAxis)
      .style("text-anchor", "left")
      .text(d.Year);


    })