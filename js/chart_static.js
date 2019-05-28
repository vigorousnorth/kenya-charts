let yearsarray = [
  {'year': 2009,  'consumption': [] },
  {'year': 2010,  'consumption': [] },
  {'year': 2011,  'consumption': [] },
  {'year': 2012,  'consumption': [] },
  {'year': 2013,  'consumption': [] },
  {'year': 2014,  'consumption': [] },
  {'year': 2015,  'consumption': [] }
];

var svg, key, width, height, yeargroup, viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;

const margin = ({top: 60, right: 20, bottom: 50, left: 50});

let x = d3.scaleLinear(), y = d3.scaleLinear()
    
let area = d3.area()
    .x(d => x(d[0]) )
    .y0(d => y(d[3]))
    .y1(d => y(d[1]))

let medianLine = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[2]))

let q1Line = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[3]));

let q3Line = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[1]))

var colorScale = d3.scaleSequential(d3.interpolateRdPu)
    .domain([2006,2015]);

//load the data and set width/height from the loaded DOM
d3.csv('data/rural_customer_data_fig_7a.csv')
  .then( ruralData => {

  ruralData.map((d,i) => {
    let yearObj = findElement(yearsarray, 'year', +d.year);
    ind = +d.months;  
    yearObj.consumption[ind] = [ +d.months, +d.q3, +d.median, +d.q1 ]; 
  });

  width = d3.select("#chart").node().getBoundingClientRect().width;
  key_w = width * 0.28;
  height = Math.min(width * 0.6, window.innerHeight * 0.7);

  d3.selectAll('.chartChatter')
    .style('margin-bottom', viewportHeight*1.3 +'px' )
    .style('top', -(margin.top-margin.bottom) +'px' )

  drawCharts(yearsarray);
  scrollInit();

});


// draw the charts
function drawCharts(yearsarray) {

  let svg = d3.select("#chart").append('svg')
    .attr('width',width)
    .attr('height', height+margin.top)
    .append('g').attr("transform", `translate(0,${margin.top})`);
  
  let currentYear = yearsarray[0].year;    

  x.domain([0, 2+d3.max(yearsarray, d => (d.consumption.length)) ])
    .range([margin.left, width - margin.right]);
  y.domain([0, d3.max(yearsarray.map(d => d3.max(d.consumption.map(d => d[1]) ) ) ) ])
    .range([height - margin.bottom, margin.top]);

  xAxis = d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0);
  yAxis = d3.axisLeft(y);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  // Add an x-axis label.
  svg.append("text")
    .attr("class", "x axislabel")
    .attr("text-anchor", "end")
    .attr("x", width - margin.right)
    .attr("y", height - margin.bottom/4)
    .text("number of months since initial connection");

  // Add an y-axis label.
  svg.append("text")
    .attr("class", "x axislabel")
    .attr("text-anchor", "end")
    .attr("x", -margin.top)
    .attr("y", margin.left/4)
    .text("monthly household consumption (kWh)")
    .attr('transform','rotate(-90)');

  // Add an legend label.

  legendLabels = svg.append('g')
    .attr("transform",`translate( ${margin.left*2}, -40)`)

  legendLabels.append("text")
    .attr("class", "legendlabel")
    .attr("text-anchor", "start")
    .attr('x', 36).attr('y', 52)
    .text('Year of connection:');

  legendLabels.append("text")
    .attr("class", "smalllegendlabel")
    .attr("text-anchor", "start")
    .attr("x", 0).attr("y", 0 )
    .attr('transform','rotate(-80)translate(-52,-5)')
    .text('3rd quartile')
  legendLabels.append("text")
    .attr("class", "smalllegendlabel")
    .attr("text-anchor", "start")
    .attr("x", 0).attr("y", 0 )
    .attr('transform','rotate(-80)translate(-50,12)')
    .text('median')
   legendLabels.append("text")
    .attr("class", "smalllegendlabel")
    .attr("text-anchor", "start")
    .attr("x", 0).attr("y", 0 )
    .attr('transform','rotate(-80)translate(-48,29)')
    .text('1st quartile')

  yeargroup = svg.selectAll("g.yeargroup")
    .data(yearsarray)
    .enter().append("g").attr('class', d=>`yeargroup year_${d.year}`);

  let chartlines = yeargroup.append("g").classed('lines', true);

  chartlines.append('path')
    .attr("fill",  d => colorScale(d.year) )
    .attr('class', 'quartileArea')
    .attr('fill-opacity',0.1)
    .datum(d =>  d.consumption)
    .attr("d", area)
    .lower();
  
  chartlines.append("path")
    .attr("stroke",  function(d) { return colorScale(d.year); })
    .attr('class', 'medianLine')
    .datum(d =>  d.consumption)
    .attr("d", medianLine)
    
  chartlines.append("path")
    .attr("stroke",  function(d) { return colorScale(d.year); })
    .attr('class', 'q1Line')
    .datum(d =>  d.consumption)
    .attr("d", q1Line)
    
  chartlines.append("path")
    .attr("stroke",  function(d) { return colorScale(d.year); })
    .attr('class', 'q3Line')
    .datum(d =>  d.consumption)
    .attr("d", q3Line)
    .attr("stroke-dasharray", function() { return '0,' + this.getTotalLength(); });

  let keygroup = yeargroup.append('g')
    .attr('class', 'keygroup visible')
    .attr('width', key_w)  
    .attr("transform", (d,i) =>
      `translate(${margin.left+12}, ${40+16*(i)})`)
    .raise();

  keygroup.append("text")
    .attr("class", "yearlabel")
    .attr("text-anchor", "start")
    .attr("x",76)
    .attr("fill", d => colorScale(d.year))
    .text(d => d.year);
  
  keygroup.append('path')
    .attr('class','q3Line')
    .attr('d', 'M 15 0 L 30 -8')
    .attr("stroke", d => colorScale(d.year))
    .attr("fill", 'none');
  keygroup.append('path')
    .attr('class','medianLine')
    .attr('d', 'M 32 0 L 47 -8')
    .attr("stroke", d => colorScale(d.year))
    .attr("fill", 'none');
  keygroup.append('path')
    .attr('class','q1Line')
    .attr('d', 'M 49 0 L 64 -8')
    .attr("stroke", d => colorScale(d.year))
    .attr("fill", 'none');

}


function findElement(arr, propName, propValue) {
  var returnVal = false;
  for (var i=0; i < arr.length; i++) {
    if (arr[i][propName] == propValue) {
          returnVal = arr[i];
      }
  } 
  return returnVal;
}
