var svg, key, width, height, yeargroup, bubbleGroups, yearLabel, animating = false;
  viewportWidth = window.innerWidth, viewportHeight = window.innerHeight;

const margin = ({top: 20, right: 40, bottom: 80, left: 30});

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
  height = window.innerHeight * 0.95;

  let svg = d3.select("#bubbleChart").append('svg')
    .attr('width',width)
    .attr('height', height+margin.top)
    .append('g').attr("transform", `translate(0,${margin.top})`);   

  x.domain([201, 100000] )
    // d3.max(data, d =>  d3.max(d.bubbleData.map(d => d[1]) ) ) 
    .range([margin.left, width - margin.right]);

  y.domain([21, 15000])
    // d3.max(data, d =>  d3.max(d.bubbleData.map(d => d[2]) ) ) ] )
    .range([height - margin.bottom, margin.top]);

  let ticks = (width<600) ? 2:20;

  xAxis = d3.axisBottom(x).ticks(ticks).tickSizeOuter(0).tickFormat(d3.format('$~s'));
    
  yAxis = d3.axisLeft(y).ticks(ticks/2).tickFormat(d3.format('~s'));

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll('text')
    .attr("y", 3)
    .attr("x", -9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(-60)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  let dataGroup = svg.append('g').attr('id','dataGroup')

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
    .attr("y", margin.left + 12)
    .text("per capita electric power consumption (kWh)")
    .attr('transform','rotate(-90)');

  let visibleLabels = ["United States of America","India","Angola",
    "Indonesia","Korea, Republic of","Japan","Nigeria",
    "China","Kenya","South Africa","Brazil", "Myanmar", "Uganda"];

  // Add an legend label.
  legendLabels = svg.append('g')
    .attr("transform",`translate( ${width - margin.right - 4}, ${height - margin.bottom - 4} )`)

  yearLabel = legendLabels.append("text")
    .attr("id", "legendYear")
    .attr("text-anchor", "end");

  filteredData = data.filter(d => ( d.bubbleData[50][0] && (+d.bubbleData[50][1]>200) && d.bubbleData[50][2] && (+d.bubbleData[50][2]>20) ))
        .sort( (a,b) => ( b.bubbleData[50][0] - a.bubbleData[50][0] ) );

  update(filteredData, 50) 


  function update(dat, index) {


    var t = d3.transition()
      .duration(500);

    bubbleGroups = dataGroup
      .selectAll('g.nationGroup')
      .data( dat, d => {
        return d.name; 
      });

    countryLabels = dataGroup
      .selectAll('text.nationLabel')
      .data( dat, d => {
        return d.name; 
      });

    // EXIT old elements not present in new data.
    bubbleGroups.exit().transition(t)
      .style('opacity',0)
      .remove();

    countryLabels.exit().transition(t)
      .style('opacity',0)
      .remove();

    // UPDATE old elements present in new data.
    bubbleGroups
      .transition(t)
      .attr('transform', d => 
        `translate(${x(d.bubbleData[index][1])},${y(d.bubbleData[index][2])})` )
      .select('circle')
        .attr('r', d =>  Math.max(2, Math.sqrt(d.bubbleData[index][0]/1000000) ) )

    countryLabels
      .transition(t)
      .attr('dx', d =>  2 + Math.max(1, Math.sqrt(d.bubbleData[index][0]/1000000) ) )
      .attr('transform', d => 
        `translate(${x(d.bubbleData[index][1])},${y(d.bubbleData[index][2])})` )
      
      
    // ENTER new elements present in new data.
    let newgroups = bubbleGroups.enter().append('g')
      .attr('class', 'nationGroup')
      .attr('transform', d => 
        `translate(${x(d.bubbleData[index][1])},${y(d.bubbleData[index][2])})` )
      .on("mouseover", d => { 
        sel = d.alphaCode3;
        d3.select(`text#${sel}`).classed("background", false );
      })      
      .on("mouseout",  d => { 
        sel = d.alphaCode3;
        d3.select(`text#${sel}`).classed("background", true );
      });

    countryLabels.enter().append('text')
      .attr('class', d => { 
        return (visibleLabels.indexOf(d.name) > -1) ? 'nationLabel highlighted' : 'nationLabel background'
      }) 
      .attr('id', d => d.alphaCode3)
      .attr('transform', d => 
        `translate(${x(d.bubbleData[index][1])},${y(d.bubbleData[index][2])})` )
      .attr('dx', d =>  2 + Math.max(1, Math.sqrt(d.bubbleData[index][0]/1000000) ) )
      .text(d =>  d.name)
      

    newgroups.append('circle')
      .attr('r', d =>  Math.max(2, Math.sqrt(d.bubbleData[index][0]/1000000) ) )
      .attr('fill', "#418FDE")  
      .attr('stroke-color','#222').attr('stroke-width','1px');

    
    yearLabel.transition(t).text( index + 1960);

  }

  function animate() {
    refId = false;
    // Start a transition that interpolates the data based on year.
    ind = 20;
    
    var countUp = function() {
        ind ++;
        if(ind >= 55) {
            window.clearInterval(refId);
            showReplayButton();
        }
        else {
          filteredData = data.filter(d => ( d.bubbleData[ind][0] && (d.bubbleData[ind][1]>200) && (d.bubbleData[ind][2])>20) && (d.bubbleData[ind][2]) )
            .sort( (a,b) => ( b.bubbleData[ind][0] - a.bubbleData[ind][0] ) );   

          update(filteredData, ind);
        }
    }

    refId = window.setInterval(countUp, 600);
  
  }



  document.getElementById("clickOverlay").addEventListener("click", function(e) {  
    if (d3.select('div#clickOverlay')) { d3.select('div#clickOverlay').style('visibility','hidden'); }
    animate();
  });

  function showReplayButton() {
    d3.select('div#clickOverlay')
      .html('REPLAY ▶')
      .style("visibility","visible")
      // .on('click', () => animate() )
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
