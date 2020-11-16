// import data from '../data/data.js';

let updateSortableBarChart = null;

function SortableBarChart() {
  document.getElementById('BarChartOrder').removeAttribute('hidden');
  let data = [
    {
      "name": "E",
      "value": 0.12702
    },
    {
      "name": "T",
      "value": 0.09056
    },
    {
      "name": "A",
      "value": 0.08167
    },
    {
      "name": "O",
      "value": 0.07507
    },
    {
      "name": "I",
      "value": 0.06966
    },
    {
      "name": "N",
      "value": 0.06749
    },
    {
      "name": "S",
      "value": 0.06327
    },
    {
      "name": "H",
      "value": 0.06094
    },
    {
      "name": "R",
      "value": 0.05987
    },
    {
      "name": "D",
      "value": 0.04253
    },
    {
      "name": "L",
      "value": 0.04025
    },
    {
      "name": "C",
      "value": 0.02782
    },
    {
      "name": "U",
      "value": 0.02758
    },
    {
      "name": "M",
      "value": 0.02406
    },
    {
      "name": "W",
      "value": 0.0236
    },
    {
      "name": "F",
      "value": 0.02288
    },
    {
      "name": "G",
      "value": 0.02015
    },
    {
      "name": "Y",
      "value": 0.01974
    },
    {
      "name": "P",
      "value": 0.01929
    },
    {
      "name": "B",
      "value": 0.01492
    },
    {
      "name": "V",
      "value": 0.00978
    },
    {
      "name": "K",
      "value": 0.00772
    },
    {
      "name": "J",
      "value": 0.00153
    },
    {
      "name": "X",
      "value": 0.0015
    },
    {
      "name": "Q",
      "value": 0.00095
    },
    {
      "name": "Z",
      "value": 0.00074
    }
  ];
  data.sort((x, y) => x.name < y.name ? -1 : 1);
  console.log(data);
  let svg = d3.select('svg');
  svg.selectAll('*').remove();
  svg.innerHTML = '';
  let width = svg.attr('width');
  let height = svg.attr('height');
  let margin = { top: 60, bottom: 60, left: 60, right: 60 };
  let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove());
  let xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));
  let x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.1);
  let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([height - margin.bottom, margin.top]);


  svg.attr("viewBox", [0, 0, width, height]);
    
  const bar = svg.append("g")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .style("mix-blend-mode", "multiply")
    .attr("x", d => x(d.name))
    .attr("y", d => y(d.value))
    .attr("height", d => y(0) - y(d.value))
    .attr("width", x.bandwidth());
  
  const gx = svg.append("g")
      .call(xAxis);
  
  const gy = svg.append("g")
      .call(yAxis);
  
  updateSortableBarChart = (order) => {
    x.domain(data.sort(order).map(d => d.name));
    const t = svg.transition()
    .duration(750);

    bar.data(data, d => d.name)
      .order()
      .transition(t)
      .delay((d, i) => i * 20)
      .attr("x", d => x(d.name));

    gx.transition(t)
      .call(xAxis)
      .selectAll(".tick")
      .delay((d, i) => i * 20);
  }

}


document.getElementById('SortableBarChart').onclick = function() {
  SortableBarChart();
};
document.getElementById('BarChartOrder').onchange = function(event) {
  let order_str = event.target.value;
  let order = (x, y) => x.name < y.name ? -1 : 1;
  if(order_str === 'value increasing') {
    order = (x, y) => x.value < y.value ? -1 : 1;
  }
  if(order_str === 'value decreasing') {
    order = (x, y) => x.value > y.value ? -1 : 1;
  }
  updateSortableBarChart(order);
};
