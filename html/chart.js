let yearsarray = [];

const height = 500;
const margin = ({top: 20, right: 20, bottom: 30, left: 30});

for (var y = 2009; y < 2018; y++) {
  let upper_quartile = 8 - y * Math.random()/2000;
  let median, lower_quartile, yearArray = [];
  for (var m = 0; m < 120; m++) {
    upper_quartile = upper_quartile - 1 + 2.5 * Math.random();
    median = upper_quartile * 0.7 + 0.2 * Math.random();
    lower_quartile = median * 0.5 + 0.2 * Math.random();
    yearArray.push([
      m,
      upper_quartile + 10,
      median + 2,
      lower_quartile
    ]); 
  }
  yearsarray.push({ 'year': y, 'consumption' : yearArray });
}

// let x = d3.scaleLinear()
//     .domain([0, d3.max(data, d => (d.consumption.length)) ])
//     .range([margin.left, width - margin.right]);

// let y = d3.scaleLinear()
//     .domain([d3.min(data.map(d => d3.min(d.consumption[3]) ) ), d3.max(data.map(d => d3.max(d.consumption[1]) ) )]).nice(5)
//     .range([height - margin.bottom, margin.top]);

// xAxis = d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0);
// yAxis = d3.axisLeft(y);

// console.log(yearsarray);

// document.addEventListener("DOMContentLoaded", function() {

//   width = window.innerWidth();

//   console.log(width);

//   let svg = d3.select("#chart").append('svg').attr('width',width).attr('height', height);
  
//   svg.append("g")
//       .call(xAxis);
  
//   svg.append("g")
//       .call(yAxis);
  
//   let yeargroup = svg.selectAll("g")
//       .data(data)
//       .enter().append("g");
  
//   yeargroup.append("path")
//       .datum(d => d.data.consumption)
//       .attr("fill", "steelblue")
//       .attr("fill-opacity", 0.2)
//       .attr("d", area);
  
//   yeargroup.append("path")
//       .datum(d =>  d.consumption)
//       .attr("fill","none")
//       .attr("stroke", "#222")
//       .attr("stroke-width","2px")
//       .attr("d", medianLine);
    
// }
