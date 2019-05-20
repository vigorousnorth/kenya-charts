let yearsarray = [], svg, key;

const height = 500; width = 800;
const margin = ({top: 20, right: 20, bottom: 50, left: 50});

const monthParse = d3.timeParse("%m/%y");
const monthArrToString = function(arr) { 
  return arr.reduce( function(acc, val) { return acc + '/' + val.toString(); } ) 
};

let monthArr = [1,10], data = [];
let upper_quartile = 100 + Math.random()*0.5;
let months = 120;
let median, lower_quartile;
for (var m = 0; m < months; m++) {
  if (monthArr[0]++ === 12) { monthArr[0] = 1; monthArr[1]++; }
  upper_quartile = upper_quartile - 0.6 + ( Math.random() );
  median = upper_quartile * 0.5 + 0.2 * Math.random();
  lower_quartile = median * 0.5 + 0.2 * Math.random();
  data.push([
    monthParse(monthArrToString(monthArr)),
    upper_quartile,
    median,
    lower_quartile
  ]); 
}

// console.log(data);


x = d3.scaleTime()
    .domain([monthParse("1/10"),monthParse("1/16")])
    .range([margin.left, width - margin.right-10])

y = d3.scaleLinear()
    .domain([0,300])
    .range([height - margin.bottom, margin.top]);

xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")).ticks(width / 80).tickSizeOuter(0);
yAxis = d3.axisLeft(y);

medianLine = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[2]));
q1Line = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[3]))
q3Line = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[1 ]))


document.addEventListener("DOMContentLoaded", function() {

  let svg = d3.select("#chart").append('svg').attr('width',width).attr('height', height);

  
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis) ;
  
  svg.append("g")
      .call(yAxis); 
  
  // Add an x-axis label.
  svg.append("text")
    .attr("class", "x axislabel")
    .attr("text-anchor", "end")
    .attr("x", width - margin.right)
    .attr("y", height - margin.bottom/4)
    .text("year");

  // Add an y-axis label.
  svg.append("text")
    .attr("class", "x axislabel")
    .attr("text-anchor", "end")
    .attr("x", -margin.top)
    .attr("y", margin.left/4)
    .text("monthly customer consumption (kWh)")
    .attr('transform','rotate(-90)');

  let korea = svg.append('g')
    .attr("class", "korea benchmarkline");
  korea.append('line')
    .attr('x1', margin.left).attr('x2',width-margin.right)
    .attr('y1', y(120)).attr('y2',y(120))
    .attr('stroke-width',1).attr('stroke-dasharray',2).attr('stroke','#222')
  korea.append('text')
    .attr('x', width-margin.right)
    .attr('text-anchor','end')
    .attr('y', y(120)).attr('dy',-10)
    .text("median monthly consumption in S. Korea");
  
  let de = svg.append('g')
    .attr("class", "germany benchmarkline");
  de.append('line')
    .attr('x1', margin.left).attr('x2',width-margin.right)
    .attr('y1', y(264)).attr('y2',y(264))
    .attr('stroke-width',1).attr('stroke-dasharray',2).attr('stroke','#222')
  de.append('text')
    .attr('x', width-margin.right)
    .attr('text-anchor','end')
    .attr('y', y(264)).attr('dy',-10)
    .text("median monthly consumption in Germany");
  
  let kenya = svg.append('g')
    .attr("class", "kenya trendline")
    .datum(data)
  kenya.append('path').classed('medianLine',true)
    .attr("d", medianLine);
  kenya.append('path').classed('qLine',true)
    .attr("d", q1Line);
  kenya.append('path').classed('qLine',true)
    .attr("d", q3Line);
  
  kenya.append('text')
    .attr('x', width-margin.right)
    .attr('text-anchor','end')
    .attr('y', y(12)).attr('dy',-10)
    .text("median monthly consumption in Kenya");

});
  