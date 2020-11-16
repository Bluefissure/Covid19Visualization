import {data as rawdata} from '../data/data.js';

let reDraw = null;

function GeoMap() {
    let sourceDOM = document.getElementById('GeoMapSource');
    sourceDOM.removeAttribute('hidden');
    
    let source = sourceDOM.value;
    if (source != 'confirmed' && source != 'deaths' && source != 'recovered') {
        source = 'confirmed';
    }
    let svg = d3.select('svg');
    svg.innerHTML = '';
    svg.selectAll('*').remove();
    let width = svg.attr('width');
    let height = svg.attr('height');
    let names = Object.keys(rawdata);
    let margin = { top: 60, bottom: 60, left: 60, right: 60 };
    let world = JSON.parse($.getJSON({'url': "./js/lib/countries-110m.json", 'async': false}).responseText);
    let countries = topojson.feature(world, world.objects.countries);
    let outline = ({type: "Sphere"});
    let projection = d3.geoEqualEarth().center([-60, 50 ]).scale(200);
    let path = d3.geoPath(projection);
    let rename = new Map([
        ["Western Sahara", "W. Sahara"],
        ["US", "United States of America"],
        ["Congo (Kinshasa)", "Dem. Rep. Congo"],
        ["Dominican Republic", "Dominican Rep."],
        ["Cote d'Ivoire", "Côte d'Ivoire"],
        ["Central African Republic", "Central African Rep."],
        ["Congo (Brazzaville)", "Congo"],
        ["Equatorial Guinea", "Eq. Guinea"],
        ["Eswatini", "eSwatini"],
        ["Korea, South", "South Korea"],
        ["Solomon Islands", "Solomon Is."],
        ["Taiwan*", "Taiwan"],
        ["Cyprus", "N. Cyprus"],
        ["Bosnia and Herzegovina", "Bosnia and Herz."],
        ["North Macedonia", "Macedonia"],
        ["South Sudan", "S. Sudan"]
    ]);
    let index = rawdata["US"].length - 1;
    let data = new Map();
    for(let [country, entries] of Object.entries(rawdata)){
        data.set(rename.get(country) || country, entries[index][source]);
    }
    console.log(data);
    let colorScale = source === 'recovered' ? d3.interpolateYlGn : (
        source === 'deaths' ? d3.interpolateYlOrRd: d3.interpolateGnBu
    );
    let color = d3.scaleSequential()
        .domain(d3.extent(Array.from(data.values()).map(d => Math.log(d+1))))
        .interpolator(colorScale)
        .unknown("#ccc");
    svg.style("display", "block")
        .attr("viewBox", [0, 0, width, height]);
    let defs = svg.append("defs");
    defs.append("path")
        .attr("id", "outline")
        .attr("d", path(outline));
    defs.append("clipPath")
        .attr("id", "clip")
        .append("use")
        .attr("xlink:href", new URL("#outline", location));
    let g = svg.append("g")
        .attr("clip-path", `url(${new URL("#clip", location)})`);
    g.append("use")
        .attr("xlink:href", new URL("#outline", location))
        .attr("fill", "white");
  
    g.append("g")
        .selectAll("path")
        .data(countries.features)
        .join("path")
            .attr("fill", d => color(Math.log(data.get(d.properties.name) + 1)))
            .attr("d", path)
        .append("title")
            .text(d => {
                if(data.has(d.properties.name)){
                    return `${d.properties.name}:\n${data.get(d.properties.name)}`;
                }
                console.log(d.properties.name);
                return `${d.properties.name}:\nN/A`;
            });
  
    g.append("path")
        .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);
  
    svg.append("use")
        .attr("xlink:href", new URL("#outline", location))
        .attr("fill", "none")
        .attr("stroke", "black");

}

document.getElementById('GeoMap').onclick = function() {
    HideAllConfigs();
    GeoMap();
};

document.getElementById('GeoMapSource').onchange = function(event) {
    GeoMap();
};