/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.70,
  height = window.innerHeight * 0.70,
  margin = { top: 20, bottom: 60, left: 60, right: 60 },
  radius = 5;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selectedParty: "All"
};

/* LOAD DATA */
d3.csv("../data/WHR20.csv", d3.autoType).then(raw_data => {
  console.log("data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  console.log('State:', state)
  //SCALES
    xScale = d3.scaleLinear()
      .domain(d3.extent(state.data, d => d.healthy_life))
      .range([margin.left, width - margin.right]) 

    yScale = d3.scaleLinear()
      .domain(d3.extent(state.data, d => d.ladder_score))
      .range([height - margin.bottom, margin.top]) //our min value is at the bottom, max value is at the top of our svg 

    colorScale = d3.scaleLinear()
      .domain(d3.extent(state.data, d => d.ladder_score))
      .range(["#2a8d8c", "#f5b845"])

  //AXES
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)

  //Creating SVG
    svg = d3.select("#d3-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height)

  //Adding Axes
    svg.append("g")
      .attr("class", "xAxis")
      .attr("transform", `translate(${0}, ${height - margin.bottom})`)
      .call(xAxis)
      .append("text")
      .attr("class", 'axis-title')
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("font-size", 10)
      .attr("font-weight", "bold")
      .attr("letter-spacing", "0.2em")
      .attr("style", "fill: #ffffff")
      .attr("text-anchor", "middle")
      .text("Healthy Life Expectancy")

    svg.append("g")
      .attr("class", "yAxis")
      .attr("transform", `translate(${margin.left}, ${0})`)
      .call(yAxis)
      .append("text")
      .attr("class", 'axis-title')
      .attr("x", -40)
      .attr("y", height / 2)
      .attr("font-size", 10)
      .attr("font-weight", "bold")
      .attr("letter-spacing", "0.2em")
      .attr("style", "fill: #ffffff; writing-mode: tb; glyph-orientation-vertical: 0")
      .attr("text-anchor", "middle")
      .text("Happiness Score")

    //SETUP  UI ELEMENTS
    const dropdown = d3.select("#dropdown") 
      
    dropdown.selectAll("options")
      .data([
      {key: "All", label: "All"}, 
      {key: "Central and Eastern Europe", label: "Central & Eastern Europe"}, 
      {key: "Commonwealth of Independent States", label: "Commonwealth of Independent States"},
      {key: "East Asia", label: "East Asia"},
      {key: "Latin America and Caribbean", label: "Latin America & Caribbean"},
      {key: "Middle East and North Africa", label: "Middle East & North Africa"},
      {key: "North America and ANZ", label: "North America & ANZ"},
      {key: "South Asia", label: "South Asia"},
      {key: "Southeast Asia", label: "Southeast Asia"},
      {key: "Sub-Saharan Africa", label: "Sub-Saharan Africa"},
      {key: "Western Europe", label: "Western Europe"}])
      .join("option")
      .attr("value", d => d.key)
      .text(d => d.label)
    
    dropdown.on("change", event => {
      console.log("selection changed", event.target.value) 
      state.selectedParty = event.target.value
      console.log("updated state", state)
      draw();
    })

      draw();

}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {

  // + FILTER DATA BASED ON STATE
  const filteredData = state.data
  .filter(d => {
    if (state.selectedParty === "All") return true 
    else return d.regional_indicator === state.selectedParty
  })

  svg.selectAll("circle")
    .data(filteredData, d => d.country_name) //arbitrary ID# to make each data point unique   
    .join(
        enter => enter.append("circle")
          .attr("r", radius)
          .attr("fill", d => colorScale(d.ladder_score))
          .style("stroke-opacity", .50)
          .style("stroke", "#ffffff")
          .attr("cy", margin.top)
          .attr("cx", d => xScale(d.healthy_life))
          .call(enter => enter
            .transition()
            .ease(d3.easeCircleIn)
            .duration(1000)
            .attr("cy", d => yScale(d.ladder_score))
          ),

        update => update
            .call(sel => sel
              .transition()
              .duration(250)
              .attr("r", radius * 1.5)
              .transition()
              .duration(500)
              .attr("r", radius)
           ),
           
        exit => exit
          .attr("cy", d => yScale(d.ladder_score))
          .attr("cx", d => xScale(d.healthy_life))
            .call(exit => exit
              .transition()
              .style("opacity", .25)
              .duration(1000)
              .attr("cx", width - margin.right)
              .attr("cy", height / 2)
              .remove()
          )
      );
}
