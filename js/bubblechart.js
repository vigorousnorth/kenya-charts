var svg, key, width, height, yeargroup, bubbleGroups, yearLabel, animating = false;
  viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;

const margin = ({top: 20, right: 20, bottom: 50, left: 50});

let x = d3.scaleLog(), y = d3.scaleLog(), regionColor = d3.scaleOrdinal();
let ind = 50  ; //index of the the year array; 20 corresponds to the year 1980, 30 too 1990, etc.

//load the data and set width/height from the loaded DOM
Promise.all( [ d3.csv('data/iso-nation-codes-and-regions.csv'), d3.csv('data/WorldBankData.csv'), document ])
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
    
    drawChart(countries);

  });





// draw the charts
function drawChart(data) {

  width = window.innerWidth;
    key_w = width * 0.28;
    height = Math.min(width * 0.8, window.innerHeight * 0.85);


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

  bubbleGroups = svg.append('g').attr('id','dataGroup')
    .selectAll('g.nationGroup')
    .data(
      data.filter(d => {
        let arr = d.bubbleData;
        let r = true;
        for (var i = 15; i <= 50; i++) {
          if (arr[i][1] && arr[i][2]) { continue; }
          else { r = false; break; }
        }
        return r;
      } )
      .sort( (a,b) => ( b.bubbleData[ind][0] - a.bubbleData[ind][0] ) )
    )
    .enter().append('g')
    .attr('transform', d => 
      `translate(${x(d.bubbleData[ind][1])},${y(d.bubbleData[ind][2])})` 
    )
    .attr('class', d => {
      return (visibleLabels.indexOf(d.name) > -1) ? 'nationGroup highlighted' : 'nationGroup background'
    })
    .on("mouseover", function() { d3.select(this).classed("background", false ) })      
    .on("mouseout",  function() { d3.select(this).classed("background", true) });


  bubbleGroups.append('circle')
    .attr('r', d =>  Math.max(2, Math.sqrt(d.bubbleData[ind][0]/1000000) ) )
    .attr('fill', d =>  regionColor(d.region))  
    .attr('stroke-color','#222').attr('stroke-width','1px');
 

  bubbleGroups.append('text')
    .attr('dx', d =>  2 + Math.max(1, Math.sqrt(d.bubbleData[ind][0]/1000000) ) )
    .text(d =>  d.name)
    

  // Add an legend label.

  legendLabels = svg.append('g')
    .attr("transform",`translate( ${width - margin.right - 4}, ${height - margin.bottom - 4} )`)


  yearLabel = legendLabels.append("text")
    .attr("id", "legendYear")
    .attr("text-anchor", "end")
    .text( ind + 1960);
  // legendLabels.append("text")
  //   .attr("class", "legendlabel")
  //   .attr("text-anchor", "start")
  //   .attr("x", 36)
  //   .attr("y", 60 )
  //   .text('(mouse over to interact)')

  document.getElementById("clickOverlay").addEventListener("click", function(e) {  
    if (d3.select('div#clickOverlay')) { d3.select('div#clickOverlay').remove(); }
    animate();
  });

  function animate() {
    animating = true;
    console.log(animating);
    // Start a transition that interpolates the data based on year.
    ind = 15;

    setInterval(function(){ if (ind<50) { ind++ } }, 1000);

    yearLabel.text( ind + 1960);
        bubbleGroups.attr('transform', d => 
          `translate(${x(d.bubbleData[ind][1])},${y(d.bubbleData[ind][2])})` ); 

    bubbleGroups.transition()
    .duration(500)
    // .delay(function(d) { return d * 40; })
    .on("start", function repeat() {
        yearLabel.text( ind + 1960);
        d3.active(this)
        .transition()
          .attr('transform', d => 
            `translate(${x(d.bubbleData[ind][1])},${y(d.bubbleData[ind][2])})` 
        )
        .transition()
          .on("end", repeat);
      });
  }

  
  
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
