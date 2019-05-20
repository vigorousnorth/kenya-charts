let yearsarray = [], svg, key;

const height = 500; width = 800;
const margin = ({top: 20, right: 20, bottom: 50, left: 50});

for (var year = 2009; year < 2018; year++) {
  let upper_quartile = 10 + (2018 - year) + Math.random()*0.5;
  let months = (2018 - year) * 12;
  let median, lower_quartile, yearArray = [];
  
  for (var m = 0; m < months; m++) {
    let g = (m<20) ? 0.9 : 0.5;
    upper_quartile = upper_quartile - 0.22 + ( g * Math.random() );
    median = upper_quartile * 0.7 + 0.2 * Math.random() + 2;
    lower_quartile = median * 0.5 + 0.2 * Math.random();
    yearArray.push([
      m,
      upper_quartile,
      median,
      lower_quartile
    ]); 
  }
  yearsarray.push({ 'year': year, 'consumption' : yearArray });
}


let x = d3.scaleLinear()
    .domain([0, d3.max(yearsarray, d => (d.consumption.length)) ])
    .range([margin.left, width - margin.right]);

let y = d3.scaleLinear()
    .domain([0, d3.max(yearsarray.map(d => d3.max(d.consumption.map(d => d[1]) ) ) ) ])
    .range([height - margin.bottom, margin.top]);

console.log(y.domain());

xAxis = d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0);
yAxis = d3.axisLeft(y);

let area = d3.area()
    .x(d => x(d[0]) )
    .y0(d => y(d[3]))
    .y1(d => y(d[1]))

let medianLine = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[2]))

var colorScale = d3.scaleSequential(d3.interpolateRdPu)
    .domain([2005,2018]);

document.addEventListener("DOMContentLoaded", function() {

  let svg = d3.select("#chart").append('svg').attr('width',width).attr('height', height);
  
  let currentYear = yearsarray[0].year;

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
    .text("monthly customer consumption (kWh)")
    .attr('transform','rotate(-90)');



  let yeargroup = svg.selectAll("g.yeargroup")
    .data(yearsarray)
    .enter().append("g").classed('yeargroup', true);

  let keygroup = yeargroup.append('g')
    .attr('class', d=> `keygroup yt year_${d.year}`)
    .attr('width', 200) 
    .attr("transform", (d,i) =>
      `translate(${width - margin.right - 100},${height - margin.bottom - 14*(yearsarray.length - i)})`)
  keygroup.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("fill", d => colorScale(d.year))
    .text(d => d.year);
  keygroup.append('path')
    .attr('class','medianLine')
    .attr('d', 'M 4 -5 L 10 -6 L 15 -4 L 20 -6')
    .attr("stroke", d => colorScale(d.year))
    .attr("fill", 'none');

  

  yeargroup.selectAll('g.lines')
    .enter().append("g").classed('lines', true);

  yeargroup.append('path')
    .attr("fill",  d => colorScale(d.year) )
    .datum(d =>  d.consumption)
    .attr("fill-opacity", 0.05)
    .attr("d", area);
  
  yeargroup.append("path")
    .attr("stroke",  function(d) { return colorScale(d.year); })
    .datum(d =>  d.consumption)
    .attr("d", medianLine)
    .attr('class', d=> `medianLine yt year_${d}`)
    .attr("stroke-dasharray", function() { return '0,' + this.getTotalLength(); })  
    .transition().delay( (d,i) => { return i*1000 })
      .ease(d3.easeLinear)
      .on("start", function repeat() {
        d3.active(this)
          .transition()
            .duration( function(d) { return 500 - (120-d.length); }) // shorter lines have shorter animations
            .attrTween("stroke-dasharray", tweenDash);
        });

  d3.selectAll('.yt')

  
  function tweenDash() {
    var l = this.getTotalLength(),
    dashInvisible = "0," + 2*l,
    dashVisible = l + "," + l,
    i = d3.interpolateString(dashInvisible, dashVisible);
    return function (t) { return i( Math.min(1, Math.max(0,t*1.5-0.5)) ); };
  }


    
});
