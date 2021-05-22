/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;

/**
 * APPLICATION STATE
 * */
let state = {
  // + SET UP STATE
  geojson: null,
  Temperature: null,
  hover: {
    screenPosition: null, // will be array of [x,y] once mouse is hovered on something
    mapLat: null, // value of long 
    mapLong: null, // value of lat
    stateName : null,
    tempChange: null,
    visible: false,
  }
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("usState.json"),
  d3.csv("geo_data.csv", d3.autoType),
]).then(([geojson, Temperature]) => {
  // + SET STATE WITH DATA
  state.geojson = geojson
  state.Temperature = Temperature
  console.log("state: ", state);
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  const projection = d3.geoAlbersUsa() //it will goes to long/lat => x/y
  .fitSize([width, height], state.geojson)


  const colorScaleL = d3.scaleLinear([0, d3.max(state.Temperature)])

  const pathFunction = d3.geoPath(projection)

// create an svg element in our main 'd3-container' element 
  svg = d3
    .select("#geo-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);


// base layer of states
const states = svg.selectAll("path")
.data(state.geojson.features)
.join("path")
.attr("stroke", "white")
.attr("fill", "#7e9776")
.attr("d", pathFunction)

// create circles

svg.selectAll("circle")
.data(state.Temperature)
.join("circle")
.attr("stroke", "white")
.attr("fill", d=>{
  if (d.Change_in_95_percent_Days>0) return "#cc6a3f" // tangerine
  else if (d.Change_in_95_percent_Days===0) return "#dad5aa" // beige 
  else return "#6ecbee" // frozen blue
})
// could not get Math.abs to work, so created new column of absolute values
.attr("r", d=>{ 
  if (d.Change_in_95_percent_Days_abs>30) return 15;
  else if (d.Change_in_95_percent_Days_abs>1 || d.Change_in_95_percent_Days_abs<29) return 7;
  else if (d.Change_in_95_percent_Days_abs===0 || d.Change_in_95_percent_Days_abs<9) return 2;
  else return 1
})
.attr("fill-opacity", "0.5")
.attr("transform", d=>{
  console.log(d)
  const point = projection([d.Long, d.Lat])
  return `translate(${point[0]}, ${point[1]})`
} )

states.on("mouseover", function(event, d){
  const {clientX, clientY} = event

  const [long, lat] = projection.invert([clientX, clientY])

  state.hover= {
    stateName: [d.State],
    tempChange: [d.Change_in_95_percent_Days_abs],
    screenPosition: [clientX, clientY],
    mapLong: [d3.format(".4f")(long)],
    mapLat: [d3.format(".4f")(lat)],
    visible: true,
  }

  draw();

}).on("mouseout", event => {
  state.hover.visible = true
  draw(); // calls the draw function
})

draw();
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {

d3.select("#geo-container") // want to add
    .selectAll('div.hover-content')
    .data([state.hover])
    .join("div")
    .attr("class", 'hover-content')
    .classed("visible", d=> d.visible)
    .style("position", 'absolute')
    .style("transform", d=> {
      // only move if we have a value for screenPosition
      if (d.screenPosition)
      return `translate(${d.screenPosition[0]}px, ${d.screenPosition[1]}px)`
    })
    .html(d=> {
      return `
      <div> State: ${d.stateName}</div>
      <div> Temperature Change: ${d.tempChange}<div>
      <div> Longitude: ${d.mapLong}</div>
      <div> Latitude: ${d.mapLat}`}
      )
}