function make_dict(data){
  var nested_data = d3.nest()
  .key(function(d) { return d["room_type"]; })
  .entries(data);

  dict = {}; 

  for(var i in nested_data){
    dict[nested_data[i].key] = nested_data[i].values.length
  }

  return dict;
}


function get_count(data){
  

  var count_type_listing = {"Manhattan":0, "Bronx":0, "Brooklyn":0, "Staten Island":0, "Queens":0}

  for(var instance in data){
    count_type_listing[data[instance]["neighbourhood_group"]] += 1;
  }

  return count_type_listing;

}


function format_data(data,groups, subgroups){
  var formatted_data = {};
  for (var grp in groups){
    record  = {"group":groups[grp]};
    for (var subgrp in subgroups){
      record[subgroups[subgrp]] = 0;
    }
    formatted_data[groups[grp]] = record;
  }

  for (instance in data){
    if (data[instance]["host_name"] in formatted_data){
      formatted_data[data[instance]["host_name"]][data[instance]["neighbourhood_group"]] += 1;
    }
  }

  return formatted_data;
}




// ################################################# Required Fomating Functions End ################################################### //


// ######################################################## Donut Chart Starts ############################################################# //





function donut_chart(restricted_data = null){

  var chart = d3.select('#donut_chart');
  chart.selectAll('*').remove();


  // set the dimensions and margins of the graph
var width = d3.select("#donut_chart_holder").node().getBoundingClientRect().width,
height = d3.select("#donut_chart_holder").node().getBoundingClientRect().height,
margin = 15;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

// The arc generator
var arc = d3.arc()
.innerRadius(radius * 0.5)         // This is the size of the donut hole
.outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
var outerArc = d3.arc()
.innerRadius(radius * 1)
.outerRadius(radius * 1)

// append the svg object to the div called 'my_dataviz'
var svg = d3.select("#donut_chart")
.append("svg")
.attr("width", width)
.attr("height", height)
.append("g")
.attr("transform", "translate(" + width / 2 + "," + (height - 55) / 2 + ")");

var data_color = ["Entire home/apt", "Private room", "Hotel room", "Shared room"]


var color = d3.scaleOrdinal()
.domain(data_color)
.range(d3.schemeDark2);

// Create dummy data
// var data = {a: 9, b: 20, c:30, d:8}

// set the color scale



  if(restricted_data === null){

  d3.csv("./static/listings.csv", function(data) {

    data_def = make_dict(data);


    // Compute the position of each group on the pie:
    var pie = d3.pie()
    .sort(null) // Do not sort group by size
    .value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(data_def));

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
    .selectAll('allSlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function(d){ return(color(d.data.key)) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)

    svg.append("text")
    .attr("x", 0)
    .attr("y", (15 / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#3399ff")
    .text("Room Types");

    function donut_click(d1){
      var filtered = data.filter(function(d){
        if (d["room_type"] == d1){
          return d
        }    
    })

    callme(filtered);

  }

    svg.selectAll("mydots")
    .data(Object.keys(data_def).sort())
    .enter()
    .append("rect")
      .attr("x", 30)
      .attr("y", function(d,i){ return 130 + i*(10+5)}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", function(d){ return color(d)})
      .on("click",donut_click)

  // Add one dot in the legend for each name.
  svg.selectAll("mylabels")
    .data(Object.keys(data_def).sort())
    .enter()
    .append("text")
      .attr("x", 42)
      .attr("y", function(d,i){ return 130 + i*(10+5) + (10/2)}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return color(d)})
      .text(function(d){ return d+" ("+String(data_def[d])+")"})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .style("font-size","12px")
      .on("click",donut_click)

}
)}else{

  data_def = make_dict(restricted_data);


  // Compute the position of each group on the pie:
  var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function(d) {return d.value; })
  var data_ready = pie(d3.entries(data_def));

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function(d){ return(color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

  svg.append("text")
  .attr("x", 0)
  .attr("y", (15 / 2))
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .style("fill", "#3399ff")
  .text("Room Types Available");

  function donut_click(d1){
    d3.csv("./static/listings.csv", function(df) {
      var filtered = df.filter(function(d){
          if (d["room_type"] == d1){
            return d
          }    
      })
      callme(filtered);

    })
  }

  svg.selectAll("mydots")
  .data(Object.keys(data_def).sort())
  .enter()
  .append("rect")
    .attr("x", 30)
    .attr("y", function(d,i){ return 130 + i*(10+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function(d){ return color(d)})
    .on("click",donut_click)

// Add one dot in the legend for each name.
svg.selectAll("mylabels")
  .data(Object.keys(data_def).sort())
  .enter()
  .append("text")
    .attr("x", 42)
    .attr("y", function(d,i){ return 130 + i*(10+5) + (10/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return color(d)})
    .text(function(d){ return d+" ("+String(data_def[d])+")"})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .style("font-size","12px")
    .on("click",donut_click)

}

}





// ######################################################## Donut Chart End ############################################################ //


// ######################################################## Box Plot Start ############################################################# //




function box_chart(restricted_data = null, y1= null, y2= null){

  var width_box = d3.select("#ny_borough_map_holder").node().getBoundingClientRect().width/3,
  height_box = d3.select("#ny_borough_map_holder").node().getBoundingClientRect().height - 30,
  margin_box = 5;
  
    // 42vh
  
  var svg_box = d3.select("#ny_borough_map")
  .append("svg")
    .attr("width", width_box-margin_box - 10)
    .attr("height", height_box-margin_box)
    .attr("id","box_plot")
  .append("g")
    .attr("transform", "translate(" + (width_box+margin_box)/2 + "," + (height_box - margin_box - 274)/2 + ")");

  d3.csv("./static/listings.csv", function(df) {
    data = new Array();
    max_data = -10000
    min_data = 10000 
    for(var i in df){
      data.push(Number(df[i].price));
      if(Number(df[i].price) < min_data){
        min_data = Number(df[i].price);
      }
      if(Number(df[i].price) > max_data){
        max_data = Number(df[i].price);
      }
    }

      // Compute summary statistics used for the box:
    var data_sorted = data.sort(d3.ascending)
    var q1 = d3.quantile(data_sorted, .25)
    var median = d3.quantile(data_sorted, .5)
    var q3 = d3.quantile(data_sorted, .75)
    var interQuantileRange = q3 - q1
    var min1 = q1 - 1.5 * interQuantileRange
    var max1 = q1 + 1.5 * interQuantileRange


    // Show the Y scale
    var y = d3.scaleLinear()
      .domain([0,max1])
      .range([height_box, 0]);
      
    var yAxis = svg_box.call(d3.axisLeft(y))

    yAxis.selectAll("path, .domain, .tick line")
    .style("stroke", "white");

    yAxis.selectAll("text")
    .style("fill", "white");



    // a few features for the box
    var center = 35
    var width1 = 25

// Show the main vertical line
svg_box
    .append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(min1) )
      .attr("y2", y(max1) )
      .attr("stroke", "white")

  // Show the box
  svg_box
  .append("rect")
    .attr("x", center - width1/2)
    .attr("y", y(q3) )
    .attr("height", (y(q1)-y(q3)) )
    .attr("width", width1 )
    .attr("stroke", "black")
    .style("fill", "#69b3a2")

// show median, min and max horizontal lines
svg_box
.selectAll("toto")
.data([10, median, max1])
.enter()
.append("line")
  .attr("x1", center-width1/2)
  .attr("x2", center+width1/2)
  .attr("y1", function(d){ return(y(d))} )
  .attr("y2", function(d){ return(y(d))} )
  .attr("stroke", "white")


  svg_box
      .append("line")
        .attr("x1", center)
        .attr("x2", center)
        .attr("y1", y2 )
        .attr("y2", y1 )
        .attr("stroke", "red")
        .attr("stroke-width", 24)
        .attr("fill","red")
        .style("opacity",0.75);

  svg_box.append("text")
      .attr("text-anchor", "middle")
      .attr("x", center/2 - 135)
      .attr("y", center/2 - 55)
      .attr("transform", "rotate(-90)")
      .style("font", "16px times")
      .style("fill", "white")
      .text("<---" + " House Cost (Per Night) " + "--->");


  svg_box
  .call( d3.brush()                 // Add the brush feature using the d3.brush function
    .extent( [ [0,0], [width_box,height_box] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
  )

      // A function that return TRUE or FALSE according if a dot is in the selection or not
      function find_data(brush_coords) {
        var y0 = brush_coords[0][1],
            y1 = brush_coords[1][1];

            var filtered = df.filter(function(d){
              if (Number(d["price"]) <= Number(y.invert(Number(y0))) && Number(d["price"]) >= Number(y.invert(Number(y1)))){
                return d;
              }
          })

          callme(filtered, y0, y1);
        }
        
          // Function that is triggered when brushing is performed
          function updateChart() {
            extent = d3.event.selection
            find_data(extent); 
          }
  })

}





// ######################################################## Box Plot End ############################################################ //


// ######################################################## NY Map Start ############################################################# //




function ny_map(restricted_data = null){

  var chart = d3.select('#ny_borough_map');
  chart.selectAll('*').remove();


  var width = d3.select("#ny_borough_map_holder").node().getBoundingClientRect().width*2/3,
  height = d3.select("#ny_borough_map_holder").node().getBoundingClientRect().height,
  margin = 5;

  // 42vh

  var svg = d3.select("#ny_borough_map")
  .append("svg")
    .attr("width", width-margin)
    .attr("height", height-margin)
    .attr("id","nyc_map")
  .append("g")
    .attr("transform", "translate(" + (width-margin)/2 + "," + (height-margin)/2 + ")");

  var path = d3.geoPath();
  var projection = d3.geoMercator()
    .scale(31600)
    .center([-73.65,40.46])
    .translate([(width-margin)/2 + 30, (width-margin)/2 + 20]);


  var zoom = d3.zoom()
    .scaleExtent([1, 5])
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed() {
    svg.selectAll("path")
      .attr("transform", d3.event.transform);
    projection.scale(d3.event.transform.k * 31600);
    path = d3.geoPath().projection(projection);
    svg.selectAll("path").attr("d", path);
  }

//   var zoomInButton = d3.select("#body")
//   .append("button")
//   .text("+")
//   .on("click", function() {
//     zoom.scaleBy(svg.transition().duration(500), 1.5);
//   });

// var zoomOutButton = d3.select("#body")
//   .append("button")
//   .text("-")
//   .on("click", function() {
//     zoom.scaleBy(svg.transition().duration(500), 1 / 1.5);
//   });

//   d3.select("#zoom-in").on("click", function() {
//     svg.transition()
//       .duration(750)
//       .call(zoom.scaleBy, 1.2);
//   });
  
//   d3.select("#zoom-out").on("click", function() {
//     svg.transition()
//       .duration(750)
//       .call(zoom.scaleBy, 0.8);
//   });

  data_glob = []
  d3.queue()
    .defer(d3.json, "./static/neighbourhoods.geojson")
    .defer(d3.csv, "./static/listings.csv", function(d) { 
      data_glob.push(d);
    })
    .await(ready);

    function ready(error, topo) {
      data_dict = {};
      unique_buroughs = [];

      for(var i in data_glob){
        if (!unique_buroughs.includes(data_glob[i]["neighbourhood_group"])){
          unique_buroughs.push(data_glob[i]["neighbourhood_group"]);
        }
        if (data_glob[i]["neighbourhood"] in data_dict){
          data_dict[data_glob[i]["neighbourhood"]] += 1
        }else{
          data_dict[data_glob[i]["neighbourhood"]] = 1
        }
      }

      data = new Map();
      min_max = -100000

      for (var i in data_dict){
        data.set(i,data_dict[i]);
        if (data_dict[i] > min_max){
          min_max = data_dict[i];
        }
      }

      var Neighbourhood_groups = Array.from(new Set(data_glob.map(function(d) { return d.neighbourhood_group; })));

      var colorScale = d3.scaleOrdinal()
      .domain(Neighbourhood_groups)
      .range(["#ff821d","Violet","#26bce1","#95fb51","Tomato"]);
      // SlateBlue
      
      // let mouseOver = function(d) {
      //   d3.selectAll(".County")
      //     .transition()
      //     .duration(200)
      //     .style("opacity", .5)
      //   d3.select(this)
      //     .transition()
      //     .duration(200)
      //     .style("opacity", 1)
      //     .style("stroke", "black")
      // }
    
      // let mouseLeave = function(d) {
      //   d3.selectAll(".County")
      //     .transition()
      //     .duration(200)
      //     .style("opacity", .8)
      //   d3.select(this)
      //     .transition()
      //     .duration(200)
      //     .style("stroke", "transparent")
      // }

      function map_click(d1){
        var filtered = data_glob.filter(function(d){ 
          if(d["neighbourhood"] == d1.properties.neighbourhood){
            return d;
          }    
        })
        callme(filtered);
      }


      function get_opacity(d1){
        if(d1 <= 5){
          return 0.35;
        }else if(d1 <= 10){
          return 0.5;
        }else if(d1 <= 15){
          return 0.65;
        }else{
          return 0.8;
        }

      }
    
      // Draw the map
      svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
          // draw each county
          .attr("d", d3.geoPath()
            .projection(projection)
          )
          // set the color of each county
          .attr("fill", function (d) {
            neigh = d.properties.neighbourhood_group;
            return colorScale(neigh);

          })
          .style("stroke",function(d){
            if (restricted_data === null){
              return "transparent";
            } else{
              var found = restricted_data.some(function(d1) {
                return d1.neighbourhood === d.properties.neighbourhood;
              })
              if (found){
                return "black";
              }
              return "transparent";
            }
          }
          
          )
          .attr("class", function(d){ return "County" } )
          .style("opacity", function(d){

            neigh = d.properties.neighbourhood_group;
            neighbrhoods = data_dict[d.properties.neighbourhood] || 0;
            if (restricted_data === null){
              return get_opacity(neighbrhoods)
            }else{
              var found = restricted_data.some(function(d1) {
                return d1.neighbourhood === d.properties.neighbourhood;
              })
              if (found){
                return 1.25*(get_opacity(neighbrhoods));
              }
              return get_opacity(neighbrhoods);
            }
          })
          .on("click",map_click)
          .append('title')
          .text((d) => `${d.properties.neighbourhood}`+": "+`${data_dict[d.properties.neighbourhood]  || 0}`);

          svg.append("text")
          .attr("x", margin-75)
          .attr("y", margin-125)
          .attr("text-anchor", "middle")
          .text("New York City - Map &")
          .style("fill", "#3399ff")
          .style("font-size","18");
        
          svg.append("text")
          .attr("x", margin-75)
          .attr("y", margin-95)
          .attr("text-anchor", "middle")
          .text("Box Plot - House Prices")
          .style("fill", "#3399ff")
          .style("font-size","18");
        
        
          svg.selectAll("mydots")
          .data(unique_buroughs)
          .enter()
          .append("rect")
          .attr("x", margin - 155)
          .attr("y", function(d,i){ return margin - 65 + i*(10+5)}) // 100 is where the first dot appears. 25 is the distance between dots
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", function(d){ return colorScale(d)})

          function call_me_labels(d1){
              var filtered = data_glob.filter(function(d){
                if (d["neighbourhood_group"] == d1){
                  return d
                }    
            })
        
            callme(filtered);
          }
        
        // // Add one dot in the legend for each name.
        svg.selectAll("mylabels")
        .data(unique_buroughs)
        .enter()
        .append("text")
          .attr("x", margin - 135)
          .attr("y", function(d,i){ return margin - 65 + i*(10+5) + (12/2)}) // 100 is where the first dot appears. 25 is the distance between dots
          .style("fill", function(d){ return colorScale(d)})
          .text(function(d){ return d })
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")
          .style("font-size","12px")
          .on("click",call_me_labels)
  }


}




// ######################################################## NY Map End ############################################################ //


// ################################################## Stacked Bar Chart Start ######################################################//



function staked_bar_graph(restricted_data = null){

  var chart = d3.select('#bar_chart');
  chart.selectAll('*').remove();

  var width = d3.select("#bar_chart_holder").node().getBoundingClientRect().width-5,
  height = d3.select("#bar_chart_holder").node().getBoundingClientRect().height-15,
  margin = { top: 10, right: 25, bottom: 30, left: 30 };

  // append the svg object to the div called 'my_dataviz'
  var svg = d3.select("#bar_chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" +  + margin.left + "," + margin.top + ")");

  if (restricted_data === null){
    d3.csv("./static/listings.csv", function(df) {

      var frequency = d3.nest()
      .key(function(d) { return d.host_name; })
      .rollup(function(v) { return v.length; })
      .entries(df);
  
      frequency.sort(function(a, b) {
        return d3.descending(a.value, b.value);
      });
  
      var top5 = frequency.slice(0, 5);
  
      var groups = {};
      for (var i = 0; i < top5.length; i++) {
        var entry = top5[i];
        groups[entry.key] = entry.value;
      }
  
      var grp = Object.keys(groups);
      var max_y = d3.max(Object.values(groups));
  
      Neighbourhood_groups = Array.from(new Set(df.map(function(d) { return d.neighbourhood_group; })));
  
      var x = d3.scaleBand()
      .domain(grp)
      .range([15, width-65])
      .padding([0.5]);
  
      var xAxis = svg.append("g")
        .attr("transform", "translate(0," + 275 + ")")
        .call(d3.axisBottom(x));
  
        xAxis.selectAll("path, .domain, .tick line")
        .style("fill", "white");
    
        xAxis.selectAll("text")
        .style("fill", "white");
      
        var colorScale = d3.scaleOrdinal()
        .domain(Neighbourhood_groups)
        .range(["#ff821d","Violet","#26bce1","#95fb51","Tomato"]);
  
      var y = d3.scaleLinear()
        .domain([0, max_y + 3])
        .range([ height - 38, 40 ]);
      // svg.append("g")
      //   .call(d3.axisLeft(y));
   
    var formatted_data = format_data(df,grp,Neighbourhood_groups);
  
    List1 = Object.values(formatted_data)
    var stackedData = d3.stack()
      .keys(Neighbourhood_groups)
      (List1);
  
      var text_title = function(d) {
        var subgroupName = d3.select(this.parentNode).datum().key;
        var subgroupValue = d.data[subgroupName];
        titleText = `${subgroupName}`+": "+`${subgroupValue  || 0}`;
        d3.select(this).append("title").text(titleText);
      }
  
      svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
          .attr("fill", function(d) { return colorScale(d.key); })
          .selectAll("rect")
          // enter a second time = loop subgroup per subgroup to add all rectangles
          .data(function(d) { return d; })
          .enter().append("rect")
            .attr("x", function(d) { return x(d.data.group); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width",x.bandwidth())
            .on("mouseover",text_title);
  
        svg.append("text")
        .attr("x", 285)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .text("Top Hosts and distribution of their respective Houses.")
        .style("fill", "#3399ff")
        .style("font-size","18");
  
        svg.selectAll()
              .data(stackedData)
              .enter()
              .append('text')
              .attr('x', function(a,i){ return x(a[i].data.group) + x.bandwidth()/2 })
              .attr('y', (a,i) => y(groups[a[i].data.group])-10)
              .attr('text-anchor', 'middle')
              .attr("fill","white")
              .text((a,i) => `${groups[a[i].data.group]}`)
  
        // svg.append("text")
        // .attr("class", "x label")
        // .attr("text-anchor", "end")
        // .attr("x", 355)
        // .attr("y", 65)
        // .style("font", "16px times")
        // .style("fill", "white")
        // .text( "<---"+" Hosts "+ "--->");
  
    })
  }else{
    df = restricted_data;

    var frequency = d3.nest()
      .key(function(d) { return d.host_name; })
      .rollup(function(v) { return v.length; })
      .entries(df);
  
      frequency.sort(function(a, b) {
        return d3.descending(a.value, b.value);
      });
  
      var top5 = frequency.slice(0, 5);
  
      var groups = {};
      for (var i = 0; i < top5.length; i++) {
        var entry = top5[i];
        groups[entry.key] = entry.value;
      }
  
      var grp = Object.keys(groups);
      var max_y = d3.max(Object.values(groups));
  
      Neighbourhood_groups = Array.from(new Set(df.map(function(d) { return d.neighbourhood_group; })));
  
      var x = d3.scaleBand()
      .domain(grp)
      .range([15, width-65])
      .padding([0.5]);
  
      var xAxis = svg.append("g")
        .attr("transform", "translate(0," + 275 + ")")
        .call(d3.axisBottom(x));
  
        xAxis.selectAll("path, .domain, .tick line")
        .style("fill", "white");
    
        xAxis.selectAll("text")
        .style("fill", "white");
      
        var colorScale = d3.scaleOrdinal()
        .domain(Neighbourhood_groups)
        .range(["#ff821d","Violet","#26bce1","#95fb51","Tomato"]);
  
      var y = d3.scaleLinear()
        .domain([0, max_y + 3])
        .range([ height - 38, 40 ]);
      // svg.append("g")
      //   .call(d3.axisLeft(y));
   
    var formatted_data = format_data(df,grp,Neighbourhood_groups);
  
    List1 = Object.values(formatted_data)
    var stackedData = d3.stack()
      .keys(Neighbourhood_groups)
      (List1);
  
      var text_title = function(d) {
        var subgroupName = d3.select(this.parentNode).datum().key;
        var subgroupValue = d.data[subgroupName];
        titleText = `${subgroupName}`+": "+`${subgroupValue  || 0}`;
        d3.select(this).append("title").text(titleText);
      }

      svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
          .attr("fill", function(d) { console.log(d.key);return colorScale(d.key); })
          .selectAll("rect")
          // enter a second time = loop subgroup per subgroup to add all rectangles
          .data(function(d) { return d; })
          .enter().append("rect")
            .attr("x", function(d) { return x(d.data.group); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width",x.bandwidth())
            .on("mouseover",text_title);
  
        svg.append("text")
        .attr("x", 285)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .text("Top Hosts and distribution of their respective Houses.")
        .style("fill", "#3399ff")
        .style("font-size","18");
  
        svg.selectAll()
              .data(stackedData)
              .enter()
              .append('text')
              .attr('x', function(a,i){ return x(a[i].data.group) + x.bandwidth()/2 })
              .attr('y', (a,i) => y(groups[a[i].data.group])-10)
              .attr('text-anchor', 'middle')
              .attr("fill","white")
              .text((a,i) => `${groups[a[i].data.group]}`)
  
        svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", 355)
        .attr("y", 65)
        .style("font", "16px times")
        .style("fill", "white")
        .text( "<---"+" Hosts "+ "--->");

  }
}




// ################################################## Stacked Bar Chart End  ######################################################//


// ##################################################### Pie Chart Start ######################################################### //

function pie_chart(restricted_data = null){
  var chart = d3.select('#pie_chart');
  chart.selectAll('*').remove();

  var width = d3.select("#pie_chart_holder").node().getBoundingClientRect().width,
  height = d3.select("#pie_chart_holder").node().getBoundingClientRect().height,
  margin = 15;

  var svg = d3.select("#pie_chart")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width/2 + "," + height/2 + ")");


  var radius = Math.min(width, height) / 2 - margin;

      selected_option = document.getElementById("select_pie").value
      console.log(selected_option)

      if(restricted_data === null){

        d3.csv("./static/listings.csv", function(data) {

          if (selected_option === "long term" || selected_option === "short term"){
            console.log(data);
            var data = data.filter(function(d){ 
              if (selected_option == "long term"){
                console.log(d["minimum_nights"]);
                if (Number(d["minimum_nights"]) >= 30){
                  return d
                }
              }else{
                if (Number(d["minimum_nights"]) < 30){
                  return d
                }
              }
              
            })
          }
      
          var data1 = get_count(data);
      
          var Neighbourhood_groups = Array.from(new Set(data_glob.map(function(d) { return d.neighbourhood_group; })));
      
          var color = d3.scaleOrdinal()
          .domain(Neighbourhood_groups)
          .range(["#ff821d","Violet","#26bce1","#95fb51","Tomato"]);
      
        var pie = d3.pie()
        .value(function(d) {return d.value; })
        var data_ready = pie(d3.entries(data1))
      
        var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
      
        svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', function(d){return color(d.data.key) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);
      
        svg.selectAll("mydots")
        .data(d3.keys(data1))
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d,i){ return 110 + i*(10+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d){ return color(d)})
      
      // Add one dot in the legend for each name.
      svg.selectAll("mylabels")
      .data(Object.keys(data1))
      .enter()
      .append("text")
        .attr("x", 12)
        .attr("y", function(d,i){ return 110 + i*(10+5) + (12/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d+" ("+String(data1[d])+")"})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "up")
        .style("font-size","12px")
      
      })
      svg.append("text")
.attr("x", margin-10)
.attr("y", margin-145)
.attr("text-anchor", "middle")
.text("Lease Type")
.style("fill", "#3399ff");
    }else{

      data = restricted_data;

      if (selected_option === "long term" || selected_option === "short term"){
        var data = data.filter(function(d){ 
          if (selected_option == "long term"){
            console.log(d["minimum_nights"]);
            if (Number(d["minimum_nights"]) >= 30){
              return d
            }
          }else{
            if (Number(d["minimum_nights"]) < 30){
              return d
            }
          }
          
        })
      }
  
      var data1 = get_count(data);
  
      var Neighbourhood_groups = Array.from(new Set(data_glob.map(function(d) { return d.neighbourhood_group; })));
  
      var color = d3.scaleOrdinal()
      .domain(Neighbourhood_groups)
      .range(["#ff821d","Violet","#26bce1","#95fb51","Tomato"]);
  
    var pie = d3.pie()
    .value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(data1))
  
    var arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)
  
    svg
    .selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', function(d){return color(d.data.key) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);
  
    svg.selectAll("mydots")
    .data(d3.keys(data1))
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function(d,i){ return 110 + i*(10+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function(d){ return color(d)})
  
  // Add one dot in the legend for each name.
  svg.selectAll("mylabels")
  .data(Object.keys(data1))
  .enter()
  .append("text")
    .attr("x", 12)
    .attr("y", function(d,i){ return 110 + i*(10+5) + (12/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return color(d)})
    .text(function(d){ return d+" ("+String(data1[d])+")"})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "up")
    .style("font-size","12px")


    svg.append("text")
    .attr("x", margin-10)
    .attr("y", margin-145)
    .attr("text-anchor", "middle")
    .text("Lease Type")
    .style("fill", "#3399ff");
  

    }


}

// function pie_chart(restricted_data = null){
//   var chart = d3.select('#pie_chart');
//   chart.selectAll('*').remove();

//   var width = d3.select("#pie_chart_holder").node().getBoundingClientRect().width,
//   height = d3.select("#pie_chart_holder").node().getBoundingClientRect().height,
//   margin = 15;

//   var svg = d3.select("#pie_chart")
//   .append("svg")
//     .attr("width", width)
//     .attr("height", height)
//   .append("g")
//     .attr("transform", "translate(" + width/2 + "," + height/2 + ")");


//   var radius = Math.min(width, height) / 2 - margin;


//   if(restricted_data === null){

//   d3.csv("./static/listings.csv", function(data) {

//     var data1 = get_count(data);

//     var color = d3.scaleOrdinal()
//   .domain(d3.keys(data1))
//   .range(d3.schemeAccent);

//   var pie = d3.pie()
//   .value(function(d) {return d.value; })
//   var data_ready = pie(d3.entries(data1))

//   var arcGenerator = d3.arc()
//   .innerRadius(0)
//   .outerRadius(radius)

//   function slice_click(d1){

//     var filtered = data.filter(function(d){ 
//       if(d1.data.key == "long term"){
//         if (Number(d["minimum_nights"]) >= 30){
//           return d
//         }
//       }else{
//         if (Number(d["minimum_nights"]) < 30){
//           return d
//         }
//       }    
//     })
//     callme(filtered);
//   }

//   svg
//   .selectAll('mySlices')
//   .data(data_ready)
//   .enter()
//   .append('path')
//   .attr('d', arcGenerator)
//   .attr('fill', function(d){return color(d.data.key) })
//   .attr("stroke", "black")
//   .style("stroke-width", "2px")
//   .style("opacity", 0.7)
//   .on("click",slice_click)

//   svg.selectAll("mydots")
//   .data(d3.keys(data1))
//   .enter()
//   .append("rect")
//   .attr("x", 0)
//   .attr("y", function(d,i){ return 110 + i*(10+5)}) // 100 is where the first dot appears. 25 is the distance between dots
//   .attr("width", 10)
//   .attr("height", 10)
//   .style("fill", function(d){ return color(d)})

// // Add one dot in the legend for each name.
// svg.selectAll("mylabels")
// .data(Object.keys(data1))
// .enter()
// .append("text")
//   .attr("x", 12)
//   .attr("y", function(d,i){ return 110 + i*(10+5) + (12/2)}) // 100 is where the first dot appears. 25 is the distance between dots
//   .style("fill", function(d){ return color(d)})
//   .text(function(d){ return d+" ("+String(data1[d])+")"})
//   .attr("text-anchor", "left")
//   .style("alignment-baseline", "middle")
//   .style("font-size","12px")

// })

// }else{
//   var data1 = get_count(restricted_data);

//   var color = d3.scaleOrdinal()
// .domain(d3.keys(data1))
// .range(d3.schemeAccent);

// var pie = d3.pie()
// .value(function(d) {return d.value; })
// var data_ready = pie(d3.entries(data1))

// var arcGenerator = d3.arc()
// .innerRadius(0)
// .outerRadius(radius)

// function slice_click(d1){
//   d3.csv("./static/listings.csv", function(df) {
//     var filtered = df.filter(function(d){
//       if(d1.data.key == "long term"){
//         if (Number(d["minimum_nights"]) >= 30){
//           return d
//         }
//       }else{
//         if (Number(d["minimum_nights"]) < 30){
//           return d
//         }
//       }
//     })

//     callme(filtered);
// })
// }

// svg
// .selectAll('mySlices')
// .data(data_ready)
// .enter()
// .append('path')
// .attr('d', arcGenerator)
// .attr('fill', function(d){return color(d.data.key) })
// .attr("stroke", "black")
// .style("stroke-width", "2px")
// .style("opacity", 0.7)
// .on("click",slice_click)


//   svg.selectAll("mydots")
// .data(d3.keys(data1))
// .enter()
// .append("rect")
// .attr("x", 0)
// .attr("y", function(d,i){ return 110 + i*(10+5)}) // 100 is where the first dot appears. 25 is the distance between dots
// .attr("width", 10)
// .attr("height", 10)
// .style("fill", function(d){ return color(d)})

// // Add one dot in the legend for each name.
// svg.selectAll("mylabels")
// .data(Object.keys(data1))
// .enter()
// .append("text")
// .attr("x", 12)
// .attr("y", function(d,i){ return 110 + i*(10+5) + (12/2)}) // 100 is where the first dot appears. 25 is the distance between dots
// .style("fill", function(d){return color(d)})
// .text(function(d){ return d+" ("+String(data1[d])+")"})
// .attr("text-anchor", "left")
// .style("alignment-baseline", "middle")
// .style("font-size","12px")
// }
// svg.append("text")
// .attr("x", margin-10)
// .attr("y", margin-145)
// .attr("text-anchor", "middle")
// .text("Lease Type")
// .style("fill", "#3399ff");
// }




// ####################################################### Pie Chart End  #########################################################//


// ######################################################## PCP Start ############################################################ //



function parallel_coordinates_plot(restricted_data = null,order = null){

  var swap_list = ""

  var chart = d3.select('#pcp');
  chart.selectAll('*').remove(); 
  
  var width = d3.select("#pcp_holder").node().getBoundingClientRect().width+45,
  height = d3.select("#pcp_holder").node().getBoundingClientRect().height-10,
  margin = {top: 25, right: 0, bottom: 5, left: -30};

  // append the svg object to the div called 'my_dataviz'
  var svg = d3.select("#pcp")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" +  + margin.left + "," + margin.top + ")");

  d3.csv("./static/listings.csv", function(data) {

  // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
  dimensions = ["room_type","price","minimum_nights","neighbourhood_group","number_of_reviews"];
  numeric_atts = ["price","minimum_nights","number_of_reviews"]

  ranges_y = {"minimum_nights":[0,180], "price":[0,1000], "number_of_reviews":[0,200]}

  console.log(order);

  if (order === null ){
    order = dimensions;
  }
  var y = {}
  for (i in order) {
    var name = order[i];
    if(numeric_atts.includes(name)){
      y[name] = d3.scaleLinear()
      .domain( ranges_y[name] )
      .range([height-30, 0])
    }else{
      var categories = d3.nest()
      .key(function(d) { return d[name]; })
      .entries(data);
      
      y[name] = d3.scalePoint()
      .domain(categories.map(function(d) {return d.key; }))
      .range([height-30, 0]);
    } 
  }

  var Neighbourhood_groups = Array.from(new Set(data.map(function(d) { return d.neighbourhood_group; })));

  var colorScale = d3.scaleOrdinal()
    .domain(Neighbourhood_groups)
    .range(["#ff821d","Violet","#26bce1","#95fb51","Tomato"]);


  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, width+35])
    .padding(2)
    .domain(order);

  // For each dimension, I build a linear scale. I store all in a y object


  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }

  // // Draw the lines
  function get_data(data){
    const filters = data.filter(function(d){
    if (Number(d.price) >= ranges_y["price"][0] && Number(d.price) <= ranges_y["price"][1] && Number(d.minimum_nights) >= ranges_y["minimum_nights"][0] && Number(d.minimum_nights) <= ranges_y["minimum_nights"][1] && Number(d.number_of_reviews) >= ranges_y["number_of_reviews"][0] && Number(d.number_of_reviews) <= ranges_y["number_of_reviews"][1])  {
      return d;
    }      
  })
  return filters;
}




  svg
    .selectAll("myPath")
    .data(function(){if (restricted_data === null){return get_data(data)}else{return get_data(restricted_data)}})
    .enter().append("path")
    .attr("d",  path)
    .attr("class", function (d) {
      return "line val" + d.neighbourhood_group;
    })
    .style("fill", "none")
    .style("stroke", function(d){
      if (restricted_data === null){
        return colorScale(d.neighbourhood_group)
      }
      else{
        var found = restricted_data.find(function(d1) {
          return d1.neighbourhood_group === d.neighbourhood_group && d1.neighbourhood_group === d.neighbourhood_group && d1.availability_365 === d.availability_365 && d1.calculated_host_listings_count === d.calculated_host_listings_count && d1.host_id === d.host_id && d1.host_name === d1.host_name && d1.id === d.id && d1.last_review === d.last_review;
        })
        if (found){
          return colorScale(d.neighbourhood_group);
        }
      }
    })
    .style("opacity", 0.5)
        .on("mouseover", function (d) {
          svg.selectAll(".line")
          .style("stroke", "grey")
          .style("opacity", "0.1");
      svg.selectAll(".val" + d.neighbourhood_group)
          .style("stroke", colorScale(d.neighbourhood_group))
          .style("opacity", "0.8");
        })
        .on("mouseleave", function (d) {
            svg.selectAll(".line")
                .style("stroke", function (d) {
                    return colorScale(d.neighbourhood_group);
                })
                .style("opacity", "0.4");
        })

        var req_cols = order;

  // Draw the axis:
  svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) {       
      var yAxis = d3.select(this).call(d3.axisLeft().scale(y[d])); 
      
    yAxis.selectAll(".tick path text")
    .style("stroke", "white");

    })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "white")
      .on("click",function(d){
        if (swap_list === ""){
            swap_list = d;
        }else{
            temp = req_cols[req_cols.indexOf(swap_list)];
            req_cols[req_cols.indexOf(swap_list)] = d;
            req_cols[req_cols.indexOf(d)] = temp;
            d3.select("#pcp").html("");
            swap_list = "";
            console.log(req_cols);
            parallel_coordinates_plot(null,order = req_cols);
        }
    });
      
      ;

    svg.selectAll( ".tick text" )
      .attr("fill", "white") // d is an element of the data: get colour from it
    

})

}




// ######################################################## PCP Ends ############################################################ //


// ###################################################### PCA Biplot Starts ########################################################### //



function pca_biplot(restricted_data = null){

  var chart = d3.select('#biplot');
  chart.selectAll('*').remove(); 


  var width = d3.select("#biplot_holder").node().getBoundingClientRect().width,
  height = d3.select("#biplot_holder").node().getBoundingClientRect().height,
  margin = 7;

  var cols_loads = ["price","minimum_nights","number_of_reviews","reviews_per_month","calculated_host_listings_count","availability_365"];
  d3.csv("./static/listings.csv", function(data){

    var svg = d3.select("#biplot")
    .append("svg")
    .attr("width", width + margin)
    .attr("height", height + margin)
    .append("g")
    .attr("transform", 
        "translate(" + margin + "," + margin + ")");

    var datum = [];
    x_limits = [10000 , -10000];
    y_limits = [10000 , -10000];

    var buroughs = [];

    for(var i = 0;i<df_trans.length;i++){
      if (x_limits[0]>df_trans[i][0]){
        x_limits[0] = df_trans[i][0]
      }
      if (y_limits[0]>df_trans[i][1]){
        y_limits[0] = df_trans[i][1]
      }
      if (x_limits[1]<df_trans[i][0]){
        x_limits[1] = df_trans[i][0]
      }
      if (y_limits[1]<df_trans[i][1]){
        y_limits[1] = df_trans[i][1]
      }
      datum.push({
            "x" : df_trans[i][0], 
            "y" : df_trans[i][1],
            "cluster" : data[i].neighbourhood_group, 
            "availability_365" : data[i].availability_365,
            "calculated_host_listings_count": data[i].calculated_host_listings_count,
            "host_id": data[i].host_id,
            "host_name": data[i].host_name,
            "id": data[i].id,
            "neighbourhood": data[i].neighbourhood,
            "last_review": data[i].last_review
        })
    }

    var buroughs = Array.from(new Set(data.map(function(d) { return d.neighbourhood_group; })));


    var color = d3.scaleOrdinal()
    .domain(buroughs)
    .range(["#ff821d","Violet","#26bce1","#95fb51","Tomato"]);

    var x = d3.scaleLinear()
    .range([ 35, width-30 ])
    .domain([-11,8]);

    var xAxis = svg.append("g")
    .attr("transform", "translate(0," + 280 + ")")
    .call(d3.axisBottom(x)
        .tickSize(8) // Increase the size of the ticks
        .tickPadding(3) // Increase the distance between the ticks and labels
    );
    xAxis.selectAll("path, .domain, .tick line")
    .style("stroke", "white");

    xAxis.selectAll("text")
    .style("fill", "white");

    var y = d3.scaleLinear()
    .domain([-2, 8])
    .range([ 280, 0]);
    
    var yAxis = svg.append("g")
    .attr("transform", "translate(35," + 0 + ")")
    .call(d3.axisLeft(y));

    yAxis.selectAll("path, .domain, .tick line")
    .style("stroke", "white");

    yAxis.selectAll("text")
    .style("fill", "white");

    var myCircle  = svg.append('g')
    .selectAll("dot")
    .data(datum)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d["x"]); } )
      .attr("cy", function (d) { return y(d["y"]); } )
      .attr("r", 2.5)
      .attr("fill", function(d){
        return color(d.cluster);      
      });


    svg.append("text")
      .attr("x", margin + 445)
      .attr("y", margin + 10)
      .attr("text-anchor", "middle")
      .text("PCA Plot - Visualize related Attributes")
      .style("fill", "#3399ff")
      .style("font-size","16");
    
    
      svg.selectAll("mydots")
      .data(buroughs)
      .enter()
      .append("rect")
      .attr("x", margin+445)
      .attr("y", function(d,i){ return margin + 25 + i*(10+5)}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", function(d){ return color(d)})
    
    // // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
    .data(buroughs)
    .enter()
    .append("text")
      .attr("x", margin + 465)
      .attr("y", function(d,i){ return margin +25 + i*(10+5) + (12/2)}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return color(d)})
      .text(function(d){ return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .style("font-size","12px")


    svg
    .call( d3.brush()                 // Add the brush feature using the d3.brush function
      .extent( [ [-10,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
    )

    // Function that is triggered when brushing is performed
    function updateChart() {
      extent = d3.event.selection;
      var arr = new Set()
      myCircle.classed("selected", function(d){ var dots = isBrushed(extent, x(d.x), y(d.y) ); if (dots){arr.add(d.neighbourhood)}; return dots; } );

      var filtered = data.filter(function(d1){
        if (arr.has(d1.neighbourhood)){
          return d1;
        }
    })

    callme(filtered);

    }

    function isBrushed(brush_coords = [[33.87501525878906,29.199996948242188],[215.4750213623047,286.26251220703125]], cx, cy) {
      var x0 = brush_coords[0][0] || 0,
          x1 = brush_coords[1][0] || 0,
          y0 = brush_coords[0][1] || 0,
          y1 = brush_coords[1][1] || 0;
     return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
    }


    svg.append("text")
    .attr("x", 250)
    .attr("y", 310)
    .style("font", "14px times")
    .text( "<---"+" PC - 1 "+ "--->")
    .style("fill","white");

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 12)
    .attr("dy", "0")
    .attr("transform", "rotate(-90)")
    .style("font", "14px times")
    .style("fill","white")
    .text("<---" + " PC - 2 " + "--->");



  });
}



// ###################################################### PCA Biplot Ends ########################################################### //