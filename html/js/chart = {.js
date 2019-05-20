let yearsarray = [], svg, key;

const height = 500; width = 800;
const margin = ({top: 20, right: 20, bottom: 50, left: 50});

for (var year = 2009; year < 2018; year++) {
  let upper_quartile = 8 + 2*(2018 - year) + Math.random()*0.5;
  let months = (2018 - year) * 12;
  let median, lower_quartile, yearArray = [];
  
  for (var m = 0; m < months; m++) {
    let g = (m<20) ? 12/(m+2) : 0.45;
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


x = d3.scaleTime()
    .domain([monthParse("1/10"),monthParse("1/16")])
    .range([margin.left, width - margin.right-10])

y = d3.scaleLinear()
    .domain([0,300])
    .range([height - margin.bottom, margin.top])
xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")).ticks(width / 80).tickSizeOuter(0);
yAxis = d3.axisLeft(y);


document.addEventListener("DOMContentLoaded", function() {

  let svg = d3.select("#chart").append('svg').attr('width',width).attr('height', height);

  
  svg.append("g")
      .call(xAxis)
  ;
  
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
    .attr("class", "kenya trendline");
  kenya.selectAll('path')
    .data(data)
    .enter().append('path')
    .attr("d", d => { 
      let dat = Object.values(d); return medianLine(dat); 
    });
  
  kenya.append('text')
    .attr('x', width-margin.right)
    .attr('text-anchor','end')
    .attr('y', y(12)).attr('dy',-10)
    .text("median monthly consumption in Kenya");

  return svg.node();
}
  