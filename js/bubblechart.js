var svg, key, width, height, yeargroup, 
  viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;

const margin = ({top: 60, right: 20, bottom: 50, left: 50});

let x = d3.scaleLog(), y = d3.scaleLog(), regionColor = d3.scaleOrdinal()

//load the data and set width/height from the loaded DOM
Promise.all( [ d3.csv('data/iso-nation-codes-and-regions.csv'), d3.csv('data/WorldBankData.csv') ])
  .then( alldata => {

    let bubbleData = alldata[1], countries = alldata[0];

    let incomeData = bubbleData.filter(d=> d.SeriesCode == "NY.GNP.PCAP.KD"),
      populationData = bubbleData.filter(d=> d.SeriesCode == "SP.POP.TOTL"),
      kwData = bubbleData.filter(d=> d.SeriesCode == "EG.USE.ELEC.KH.PC");

    regionColor.domain( countries.map(d => d.region) )
      .range([ '#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00' ]);

    // process the data
    countries.map( d => {

      let incomeRow = findElement(incomeData, 'alphaCode3', d.alphaCode3),
        popRow = findElement(populationData, 'alphaCode3', d.alphaCode3),
        kwRow = findElement(kwData, 'alphaCode3', d.alphaCode3);

      let data = [];

      for (year = 1960; year<2019; year++) {
        let key = "YR" + year,
          pop = popRow[key] == '..' ? false : +popRow[key],
          income = incomeRow[key] == '..' ? false : +incomeRow[key],
          kw = kwRow[key] == '..' ? false : +kwRow[key],
        thisYearData = [ pop, income, kw, key ];
        data.push(thisYearData);
      }

      d.bubbleData = data;

      return d;

    });
    
    width = d3.select("#bubbleChart").node().getBoundingClientRect().width;
    key_w = width * 0.28;
    height = Math.min(width * 0.8, window.innerHeight * 0.85);


    drawChart(countries);

  });



// draw the charts
function drawChart(data) {

  let svg = d3.select("#bubbleChart").append('svg')
    .attr('width',width)
    .attr('height', height+margin.top)
    .append('g').attr("transform", `translate(0,${margin.top})`);   

  x.domain([300, 80000] )
    // d3.max(data, d =>  d3.max(d.bubbleData.map(d => d[1]) ) ) 
    
    .range([margin.left, width - margin.right]);

  y.domain([50, 15000])
    // d3.max(data, d =>  d3.max(d.bubbleData.map(d => d[2]) ) ) ] )
    .range([height - margin.bottom, margin.top]);


  xAxis = d3.axisBottom(x).ticks(20).tickSizeOuter(0).tickFormat(d3.format('$~s'));
  yAxis = d3.axisLeft(y).tickFormat(d3.format('~s'));

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
    .text("per capita income (in inflation-adjusted 2010 US dollars)");

  // Add an y-axis label.
  svg.append("text")
    .attr("class", "x axislabel")
    .attr("text-anchor", "end")
    .attr("x", -margin.top)
    .attr("y", margin.left/4)
    .text("per capita electric power consumption (kWh)")
    .attr('transform','rotate(-90)');

  let visibleLabels = ["United States of America","Australia","India","Angola",
    "Indonesia","Korea, Republic of","Japan","Mexico","Nigeria","Saudi Arabia",
    "China","Kenya","South Africa","Brazil","Netherlands"];

  let bubbleGroups = svg.append('g').attr('id','dataGroup')
    .selectAll('g.nationGroup')
    .data(
      data.filter(d => {
        let arr = d.bubbleData;
        let yr2010 = arr[50];
        return (yr2010[1] && yr2010[2] ) 
      } )
      .sort( (a,b) => ( b.bubbleData[50][0] - a.bubbleData[50][0] ) )
    )
    .enter().append('g')
    .attr('transform', d => `translate(${x(d.bubbleData[50][1])},${y(d.bubbleData[50][2])})`)
    .attr('class', d => {
      console.log( visibleLabels.indexOf(d.name) );
      return (visibleLabels.indexOf(d.name) > -1) ? 'nationGroup highlighted' : 'nationGroup background'
    })
    .on("mouseover", function() { d3.select(this).classed("background", false ) })      
    .on("mouseout",  function() { d3.select(this).classed("background", true) });




  bubbleGroups.append('circle')
    .attr('r', d =>  Math.max(2, Math.sqrt(d.bubbleData[50][0]/1000000) ) )
    .attr('fill', d =>  regionColor(d.region))  
    .attr('stroke-color','#222').attr('stroke-width','1px');

  

  bubbleGroups.append('text')
    .attr('dx', d =>  2 + Math.max(1, Math.sqrt(d.bubbleData[50][0]/1000000) ) )
    .text(d =>  d.name)
    

  // Add an legend label.

  legendLabels = svg.append('g')
    .attr("transform",`translate( ${margin.left*2}, -40)`)

  // legendLabels.append("text")
  //   .attr("class", "legendlabel")
  //   .attr("text-anchor", "start")
  //   .attr('x', 36).attr('y', 40)
  //   .text('Year of connection:')
  // legendLabels.append("text")
  //   .attr("class", "legendlabel")
  //   .attr("text-anchor", "start")
  //   .attr("x", 36)
  //   .attr("y", 60 )
  //   .text('(mouse over to interact)')
  
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
