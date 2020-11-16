"use strict";
import {data as rawdata} from '../data/data.js';

let barCharTicker =  null;

function BarChartRace() {
  document.getElementById("BarChartRaceSource").removeAttribute("hidden");
  let svg = d3.select('svg');
  svg.selectAll('*').remove();
  svg.innerHTML = '';
  let width = svg.attr('width');
  let margin = {top: 16, right: 6, bottom: 6, left: 200};
  let barSize = 48;
  let names = Object.keys(rawdata);
  let source = document.getElementById("BarChartRaceSource").value;
  if (source != 'confirmed' && source != 'deaths' && source != 'recovered') {
    source = 'confirmed';
  }
  // console.log(rawdata);
  let data = [];
  for(let [country, entries] of Object.entries(rawdata)){
    for(let entry of entries){
      data.push({
        'name': country,
        'date': entry.date,
        'value': entry[source]
      })
    }
  }
  let n = 20;
  let k = 1;
  // console.log(data);
  let datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => d.date, d => d.name))
    .map(([date, data]) => [new Date(date), data])
    .sort(([a], [b]) => d3.ascending(a, b));
  // console.log(datevalues);
  function rank(value) {
    const data = Array.from(names, name => ({name, value: value(name)}));
    data.sort((a, b) => d3.descending(a.value, b.value));
    for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
    return data;
  }
  let keyframes = () => {
    const keyframes = [];
    let ka, a, kb, b;
    for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
      for (let i = 0; i < k; ++i) {
        const t = i / k;
        keyframes.push([
          new Date(ka * (1 - t) + kb * t),
          rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
        ]);
      }
    }
    keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);
    return keyframes;
  };
  keyframes = keyframes();
  let nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name);
  let prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
  let next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));

  let height = margin.top + barSize * n + margin.bottom;
  let y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
    .padding(0.1);
  let x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);
  let color = () =>{
    return d3.hsl(Math.random()*360,0.75,0.75);
  }
  let formatDate = d3.utcFormat("%Y-%m-%d");
  String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
  }
  function ticker(svg) {
    const now = svg.append("text")
        .style("font", `bold ${barSize}px var(--sans-serif)`)
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .attr("x", width - 6)
        .attr("y", margin.top + barSize * (n - 0.45))
        .attr("dy", "0.32em")
        .text(formatDate(keyframes[0][0]));
  
    return ([date], transition) => {
      now.text("#" + source.capitalize() + " till " + formatDate(date));
    };
  };
  function axis(svg) {
    const g = svg.append("g")
        .attr("transform", `translate(0,${margin.top})`);
  
    const axis = d3.axisTop(x)
        .ticks(width / 160)
        .tickSizeOuter(0)
        .tickSizeInner(-barSize * (n + y.padding()));
  
    return (_, transition) => {
      g.transition(transition).call(axis);
      g.select(".tick:first-of-type text").remove();
      g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
      g.select(".domain").remove();
    };
  };
  let formatNumber = d3.format(",d");
  function textTween(a, b) {
    const i = d3.interpolateNumber(a, b);
    return function(t) {  // a + (b - a) * t
      this.textContent = formatNumber(i(t));
    };
  };
  function labels(svg) {
    let label = svg.append("g")
        .style("font", "bold 12px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
      .selectAll("text");
  
    return ([date, data], transition) => label = label
      .data(data.slice(0, n), d => d.name)
      .join(
        enter => enter.append("text")
          .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
          .attr("y", y.bandwidth() / 2)
          .attr("x", -6)
          .attr("dy", "-0.25em")
          .text(d => d.name)
          .call(text => text.append("tspan")
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "normal")
            .attr("x", -6)
            .attr("dy", "1.15em")),
        update => update,
        exit => exit.transition(transition).remove()
          .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
          .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
      )
      .call(bar => bar.transition(transition)
        .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
        .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))));
  }
  function bars(svg) {
    let bar = svg.append("g")
        .attr("fill-opacity", 0.6)
      .selectAll("rect");
  
    return ([date, data], transition) => bar = bar
      .data(data.slice(0, n), d => d.name)
      .join(
        enter => enter.append("rect")
          .attr("fill", color)
          .attr("height", y.bandwidth())
          .attr("x", x(0))
          .attr("y", d => y((prev.get(d) || d).rank))
          .attr("width", d => x((prev.get(d) || d).value) - x(0)),
        update => update,
        exit => exit.transition(transition).remove()
          .attr("y", d => y((next.get(d) || d).rank))
          .attr("width", d => x((next.get(d) || d).value) - x(0))
      )
      .call(bar => bar.transition(transition)
        .attr("y", d => y(d.rank))
        .attr("width", d => x(d.value) - x(0)));
  }

  let duration = 1100;
  let keyframe_idx = 0;
  
  svg.attr("viewBox", [0, 0, width, height]);
  const updateBars = bars(svg);
  const updateAxis = axis(svg);
  const updateLabels = labels(svg);
  const updateTicker = ticker(svg);

  barCharTicker = (speed) => {
    let Ticker = d3.interval(e => {
      const transition = svg.transition()
          .duration(duration)
          .ease(d3.easeLinear);
      const keyframe = keyframes[keyframe_idx];
      if(keyframe === undefined) Ticker.stop();
      
      x.domain([0, keyframe[1][0].value]);
      try{
        updateAxis(keyframe, transition);
        updateBars(keyframe, transition);
        updateLabels(keyframe, transition);
        updateTicker(keyframe, transition);
      }catch(err){
        console.error(err);
        Ticker.stop();
      }
      if(keyframe_idx == keyframes.length - 1) Ticker.stop();
      keyframe_idx += speed;
      if(keyframe_idx > keyframes.length) keyframe_idx = keyframes.length - 1;
    }, duration);
  };
  barCharTicker(7);
}

document.getElementById('BarChartRace').onclick = function() {
  HideAllConfigs();
  BarChartRace();
};

document.getElementById('BarChartRaceSource').onchange = function(event) {
  BarChartRace();
};
