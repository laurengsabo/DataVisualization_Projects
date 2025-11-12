const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const tooltip = d3.select(".tooltip");

d3.csv("colleges.csv").then(data => {
    const regionCount = d3.rollup(data, v => v.length, d => d['Region']);
    const regionData = Array.from(regionCount, ([region, count]) => ({ region, count }));

    const color = d3.scaleOrdinal()
        .domain(["New England", "Great Lakes", "Great Plains", "Mid-Atlantic", "Southeast", "Southwest", "Rocky Mountains", "Far West", "Outlying Areas"])
        .range(["#ea75bd", "#d13531", "#8a574e", "#379f32", "#ac6cbf", "#3076b4", "#fc8127", "#7f7f7f", "#bbbd3a"]);

    const maxCount = d3.max(regionData, d => d.count);
    const radiusScale = d3.scaleSqrt()
        .domain([0, maxCount])
        .range([30, 100]);

    const simulation = d3.forceSimulation(regionData)
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05))
        .force("collide", d3.forceCollide(d => radiusScale(d.count) + 2))
        .on("tick", bubbleMaster);

    function bubbleMaster() {
        const bubbles = svg.selectAll(".bubble")
            .data(regionData)
            .join("circle")
            .attr("class", "bubble")
            .attr("r", d => radiusScale(d.count))
            .attr("fill", d => color(d.region))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .on("mousemove", function (event) {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d.region}: ${d.count} Schools`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", function (event, d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function (event, d) {
                localStorage.setItem('selectedRegion', d.region);
                window.location.href = 'page_2.html';
            });

        const regionLabels = svg.selectAll(".region-label")
            .data(regionData)
            .join("text")
            .attr("class", "region-label")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .text(d => d.region)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#fff")
            .style("pointer-events", "none")
            .style("dominant-baseline", "central");
    }
});