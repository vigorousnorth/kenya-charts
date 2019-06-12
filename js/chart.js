let yearsarray = [
  {'year': 2009,  'consumption': [] },
  {'year': 2010,  'consumption': [] },
  {'year': 2011,  'consumption': [] },
  {'year': 2012,  'consumption': [] },
  {'year': 2013,  'consumption': [] },
  {'year': 2014,  'consumption': [] },
  {'year': 2015,  'consumption': [] }
];

var svg, key, width, height, yeargroup, viewportWidth = window.innerWidth, viewportHeight = window.innerHeight, pt;

const margin = ({top: 75, right: 20, bottom: 40, left: 50});

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

var colorScale = d3.scaleLinear()
    .domain([2009, 2011, 2013 ,2015])
    .range( ['#7ae8b6','#418FDE','#6399AE','#055459'] )

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
  height = (window.innerHeight -140) * 0.95;

  d3.select("#chart").style("height", height);

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
  y.domain([0, d3.max(yearsarray.map(d => d3.max(d.consumption.map(d => d[1] - 5) ) ) ) ])
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
    .attr("transform",`translate( ${margin.left*1.8}, -${margin.top*0.8})`)
    .attr("id","legendLabels")

  legendLabels.append("text")
    .attr("class", "legendlabel")
    .attr("text-anchor", "start")
    .attr('x', 36).attr('y', 40)
    .text('Year of connection:')

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

  // chartlines.append('path')
  //   .attr("fill",  d => colorScale(d.year) )
  //   .attr('class', 'quartileArea')
  //   .attr('fill-opacity',0)
  //   .datum(d =>  d.consumption)
  //   .attr("d", area)
  //   .lower();
  
  chartlines.append("path")
    .attr("stroke",  function(d) { return colorScale(d.year); })
    .attr('class', 'medianLine')
    .datum(d =>  d.consumption)
    .attr("d", medianLine)
    .attr("stroke-dasharray", function() { return '0,' + this.getTotalLength(); });

  chartlines.append("path")
    .attr("stroke",  function(d) { return colorScale(d.year); })
    .attr('class', 'q1Line quartileLine')
    .datum(d =>  d.consumption)
    .attr("d", q1Line)    
    .style('opacity', 0);

  chartlines.append("path")
    .attr("stroke",  function(d) { return colorScale(d.year); })
    .attr('class', 'q3Line quartileLine')
    .datum(d =>  d.consumption)
    .attr("d", q3Line)
    .style('opacity', 0);

  let keygroup = yeargroup.append('g')
    .attr('class', 'keygroup')
    .attr('width', key_w)  
    .attr("transform", (d,i) =>
      `translate(${margin.left}, ${-margin.top*0.8 + 78 + 16*(i)})`)
    .on('mouseover', showYear)
    .on('mouseout', showAll)
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

function showYear(d) { 
  let selector = `.year_${d.year}`;
  clearTimeout(pt);
  d3.selectAll('.yeargroup').classed('active', false);

  d3.select("#clickOverlay").style("visibility", "hidden");
  //add active class to highlighted key group
  // d3.select(this).classed('active', true);
  //add active class to highlighted median line
  d3.selectAll(selector).classed('active', true);
  d3.selectAll(selector).selectAll("path.quartileLine")
    .transition()
    .duration(250)
    .style("opacity", 1);
}

function showAll(d) { 
  let selector = `.year_${d.year}`;

  d3.selectAll('.active').classed('active', false);
  d3.selectAll(selector).selectAll("path.quartileLine")
    .transition()
    .duration(250)
    .style("opacity", 0.25);

  pt = setTimeout( function() { d3.select("#clickOverlay").style("visibility", "visible"); }, 1000);
}

function hideYearGroup(indexArray) { 
  d3.selectAll('.active').classed('active', false);
  let target = yeargroup.filter((d,i) => (indexArray.indexOf(i) > -1) );

  target.selectAll('path.medianLine')
    .attr("stroke-dasharray", function() { return '0,' + this.getTotalLength(); });

  target.selectAll('path.quartileLine')
    .style('opacity', 0);
    
  target.selectAll('g.keygroup').classed('visible',false);

}

function animateYearGroup(indexArray) {
  yeargroup  
    .filter((d,i) => (indexArray.indexOf(i) > -1) )
    .transition()
      .delay( (d,i) => { return (i+1)*800 })
      .ease(d3.easeLinear)
      .on("start", function() {
        let c = d3.select(this).attr('class').split(' ')[1];
        d3.selectAll('.active').classed('active',false);
        
        d3.select(this).select('g.keygroup').classed('visible',true);

        d3.active(this).select('g.lines path.medianLine')
          .transition()
            .duration( function(d) {return 500 - (120-d.consumption.length); }) 
             // shorter lines have shorter animations
            .attrTween("stroke-dasharray", tweenDash);

        d3.active(this).selectAll('path.quartileLine')
          
          .transition()
            .duration( function(d) {console.log(d); return 500 - (120-d .length); })
            .style('opacity', 0.25);

        // d3.active(this).select('g.lines path.q3Line')
        //   .transition()
        //     .duration( function(d) {return 500 - (120-d.consumption.length); })
        //     .attr('opacity',1)
        //     .attr('class','q3Line quartileLine');

      });

  if (indexArray.length > 1) { 
    window.setTimeout( showReplayButton, indexArray.length * 800 + 1000);  
  }
}

function showReplayButton() {
  d3.select('div#clickOverlay')
    .html('REPLAY ▶')
    .style("visibility","visible")
    .on('click', () => hideYearGroup([1,2,3,4,5,6]) )
}

function tweenDash() {
  var l = this.getTotalLength(),
  dashInvisible = "0," + 2*l,
  dashVisible = l + "," + l,
  i = d3.interpolateString(dashInvisible, dashVisible);
  return function (t) { return i( Math.min(1, Math.max(0,t*1.5-0.5)) ); };
}

function scrollInit() {
  animateYearGroup([0]);

  document.getElementById("clickOverlay").addEventListener("click", function(e) {  

    if (document.getElementById("clickOverlay")) { d3.select('div#clickOverlay').style("visibility","hidden"); }

    d3.select("g#legendLabels").append("text")
      .attr("class", "legendlabel")
      .attr("text-anchor", "start")
      .attr("x", 36)
      .attr("y", 60 )
      .text('(mouse over to interact)')  
    
    animateYearGroup([1,2,3,4,5,6]);
  
  });
}

window.addEventListener("resize", function() {
  if (window.innerWidth != viewportWidth)  { 
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight; 
    drawCharts(); scrollInit(); }
});


function findElement(arr, propName, propValue) {
  var returnVal = false;
  for (var i=0; i < arr.length; i++) {
    if (arr[i][propName] == propValue) {
          returnVal = arr[i];
      }
  } 
  return returnVal;
}
