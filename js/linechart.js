import {data as rawdata} from '../data/data.js';

let reDraw = null;

function LineChart() {
  let sourceDOM = document.getElementById('LineChartSource');
  sourceDOM.removeAttribute('hidden');
  sourceDOM.innerHTML = "";
  let names = Object.keys(rawdata);
  let svg = d3.select('svg');
  svg.innerHTML = '';
  svg.selectAll('*').remove();
  let width = svg.attr('width');
  let height = svg.attr('height');
  let margin = { top: 60, bottom: 60, left: 60, right: 60 };
  
  d3.select("#LineChartSource")
    .selectAll('myOptions')
    .data(names)
    .enter()
      .append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })

  let data = rawdata[sourceDOM.value];
  // console.log(data);
  let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
      .attr("x", 3)
      .attr("text-anchor", "start")
      .attr("font-weight", "bold"));
  let xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));
  let x = d3.scaleUtc()
    .domain(d3.extent(data, d => new Date(d.date)))
    .range([margin.left, width - margin.right])
  let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.confirmed)]).nice()
    .range([height - margin.bottom, margin.top]);
  
  const gx = svg.append("g").call(xAxis);
  
  const gy = svg.append("g").call(yAxis);
  
  let line = d3.line()
    .defined(d => !isNaN(d.confirmed))
    .x(d => x(new Date(d.date)))
    .y(d => y(d.confirmed));
  
  let path = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 4)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);

  let line_d = d3.line()
    .defined(d => !isNaN(d.deaths))
    .x(d => x(new Date(d.date)))
    .y(d => y(d.deaths));
  
  let path_d = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 4)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line_d);

  let line_r = d3.line()
    .defined(d => !isNaN(d.recovered))
    .x(d => x(new Date(d.date)))
    .y(d => y(d.recovered));
  
  let path_r = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 4)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line_r);
  
  let addLegend = (x, y, color, text) => {
    let legend = svg.append("g")
      .attr("class", "legend")
      .attr("x", x)
      .attr("y", y)
      .attr("height", 100)
      .attr("width", 100);

    legend.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", color);

    legend.append("text")
        .attr("x", x)
        .attr("y", y)
        .text(text);
  }
  addLegend(100, 25, "steelblue", "Confirmed");
  addLegend(100, 55, "red", "Deaths");
  addLegend(100, 85, "green", "Recovered");


  
  function update(selectedContry) {
    data = rawdata[selectedContry];

    y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.confirmed)]).nice()
      .range([height - margin.bottom, margin.top]);
    gy.call(yAxis);

    line = d3.line()
      .defined(d => !isNaN(d.confirmed))
      .x(d => x(new Date(d.date)))
      .y(d => y(d.confirmed));
    path.datum(data)
      .transition()
      .duration(1000)
      .attr("d", line);

    line_d = d3.line()
      .defined(d => !isNaN(d.deaths))
      .x(d => x(new Date(d.date)))
      .y(d => y(d.deaths));
      
    path_d.datum(data)
      .transition()
      .duration(1000)
      .attr("d", line_d);

    line_r = d3.line()
      .defined(d => !isNaN(d.recovered))
      .x(d => x(new Date(d.date)))
      .y(d => y(d.recovered));
      
    path_r.datum(data)
      .transition()
      .duration(1000)
      .attr("d", line_r);
  }
  d3.select("#LineChartSource").on("change", function(d) {
      var selectedOption = d3.select(this).property("value");
      console.log(selectedOption);
      update(selectedOption);
  })
}

document.getElementById('LineChart').onclick = function() {
  HideAllConfigs();
  LineChart();
};