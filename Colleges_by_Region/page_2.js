const regionLabelElement = d3.select("#region-label");
const scatterplot1Svg = d3.select("#scatterplot1");
const scatterplot2Svg = d3.select("#scatterplot2");
const backButton = d3.select("#back-button");
const tooltip = d3.select(".tooltip");

const margin = { top: 20, right: 30, bottom: 50, left: 40 };
const width = +scatterplot1Svg.attr("width") - margin.left - margin.right;
const height = +scatterplot1Svg.attr("height") - margin.top - margin.bottom;

const xDropdown1 = d3.select("#x-axis1");
const yDropdown1 = d3.select("#y-axis1");
const xDropdown2 = d3.select("#x-axis2");
const yDropdown2 = d3.select("#y-axis2");

const attributes = [
    "Admission Rate", "ACT Median", "SAT Average", "Undergrad Population",
    "% White", "% Black", "% Hispanic", "% Asian", "% American Indian",
    "% Pacific Islander", "% Biracial", "Average Cost", "Expenditure Per Student",
    "Completion Rate 150% time", "Retention Rate", "Median Debt on Graduation",
    "Median Earnings 8 years After Entry"
];

attributes.forEach(attr => {
    xDropdown1.append("option").text(attr).attr("value", attr);
    yDropdown1.append("option").text(attr).attr("value", attr);
    xDropdown2.append("option").text(attr).attr("value", attr);
    yDropdown2.append("option").text(attr).attr("value", attr);
});

xDropdown1.property("value", "Admission Rate");
yDropdown1.property("value", "Admission Rate");
xDropdown2.property("value", "Admission Rate");
yDropdown2.property("value", "Admission Rate");

let filteredData = [];
let brushedCirc = [];
let clickedCircle = null;

const xScale1 = d3.scaleLinear().range([0, width]);
const yScale1 = d3.scaleLinear().range([height, 0]);
const xScale2 = d3.scaleLinear().range([0, width]);
const yScale2 = d3.scaleLinear().range([height, 0]);

const xAxis1 = d3.axisBottom(xScale1).tickFormat(d3.format(".2s"));
const yAxis1 = d3.axisLeft(yScale1).tickFormat(d3.format(".2s"));
const xAxis2 = d3.axisBottom(xScale2).tickFormat(d3.format(".2s"));
const yAxis2 = d3.axisLeft(yScale2).tickFormat(d3.format(".2s"));

const colorScale = d3.scaleOrdinal()
    .domain(["Public", "Private"])
    .range(["green", "red"]);

const g1 = scatterplot1Svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
const g2 = scatterplot2Svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const xAxisG1 = g1.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
const yAxisG1 = g1.append("g").attr("class", "y-axis");
const xAxisG2 = g2.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
const yAxisG2 = g2.append("g").attr("class", "y-axis");

const brush1 = d3.brush().extent([[0, 0], [width, height]]).on("start brush end", event => brushed(event, 1));
const brush2 = d3.brush().extent([[0, 0], [width, height]]).on("start brush end", event => brushed(event, 2));

const brushG1 = g1.append("g").attr("class", "brush").call(brush1);
const brushG2 = g2.append("g").attr("class", "brush").call(brush2);

function brushed(event, circNum) {
    if (event.selection) {
        let x0, y0, x1, y1;
        let xScale, yScale;
        let xAttr, yAttr;

        if (circNum === 1) {
            [x0, y0] = event.selection[0];
            [x1, y1] = event.selection[1];
            xScale = xScale1;
            yScale = yScale1;
            xAttr = xDropdown1.property("value");
            yAttr = yDropdown1.property("value");
        } else {
            [x0, y0] = event.selection[0];
            [x1, y1] = event.selection[1];
            xScale = xScale2;
            yScale = yScale2;
            xAttr = xDropdown2.property("value");
            yAttr = yDropdown2.property("value");
        }

        brushedCirc = filteredData.filter(d =>
            xScale(+d[xAttr]) >= x0 &&
            xScale(+d[xAttr]) <= x1 &&
            yScale(+d[yAttr]) >= y0 &&
            yScale(+d[yAttr]) <= y1
        ).map(d => d['Name']);

        updateCircOp();
    } else {
        brushedCirc = [];
        updateCircOp();
    }
}

function updateCircOp() {
    g1.selectAll(".dot").style("opacity", d => brushedCirc.includes(d['Name']) || (clickedCircle && clickedCircle['Name'] === d['Name']) ? 1 : 0.4);
    g2.selectAll(".dot").style("opacity", d => brushedCirc.includes(d['Name']) || (clickedCircle && clickedCircle['Name'] === d['Name']) ? 1 : 0.4);
}

function updateScatter() {
    const selectedRegion = localStorage.getItem('selectedRegion');
    regionLabelElement.text(`Region: ${selectedRegion}`);

    d3.csv("colleges.csv").then(data => {
        filteredData = data.filter(d => d['Region'] === selectedRegion);

        const xAttr1 = xDropdown1.property("value");
        const yAttr1 = yDropdown1.property("value");
        const xAttr2 = xDropdown2.property("value");
        const yAttr2 = yDropdown2.property("value");

        xScale1.domain(d3.extent(filteredData, d => +d[xAttr1]));
        yScale1.domain(d3.extent(filteredData, d => +d[yAttr1]));
        xScale2.domain(d3.extent(filteredData, d => +d[xAttr2]));
        yScale2.domain(d3.extent(filteredData, d => +d[yAttr2]));

        const xAxis1 = d3.axisBottom(xScale1);
        const yAxis1 = d3.axisLeft(yScale1);
        const xAxis2 = d3.axisBottom(xScale2);
        const yAxis2 = d3.axisLeft(yScale2);

        xAxisG1.call(xAxis1);
        yAxisG1.call(yAxis1);
        xAxisG2.call(xAxis2);
        yAxisG2.call(yAxis2);

        xAxisG1.selectAll(".x-label").remove();
        xAxisG1.append("text")
            .attr("class", "x-label")
            .attr("transform", `translate(${width / 2}, ${margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("fill", "black")
            .text(xAttr1);

        yAxisG1.selectAll(".y-label").remove();
        yAxisG1.append("text")
            .attr("class", "y-label")
            .attr("y", -margin.left)
            .attr("x", 0 - (height / 2))
            .attr("transform", "rotate(-90)")
            .attr("dy", ".70em")
            .style("text-anchor", "middle")
            .style("fill", "black")
            .text(yAttr1);

        xAxisG2.selectAll(".x-label").remove();
        xAxisG2.append("text")
            .attr("class", "x-label")
            .attr("transform", `translate(${width / 2}, ${margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("fill", "black")
            .text(xAttr2);

        yAxisG2.selectAll(".y-label").remove();
        yAxisG2.append("text")
            .attr("class", "y-label")
            .attr("y", -margin.left)
            .attr("x", 0 - (height / 2))
            .attr("transform", "rotate(-90)")
            .attr("dy", ".70em")
            .style("text-anchor", "middle")
            .style("fill", "black")
            .text(yAttr2);

        const circles1 = g1.selectAll(".dot")
            .data(filteredData, d => d['Name'])
            .join("circle")
            .attr("class", "dot")
            .attr("r", 5)
            .style("opacity", 0.4)
            .style("fill", d => colorScale(d.Control))
            .attr("cx", d => xScale1(+d[xAttr1]))
            .attr("cy", d => yScale1(+d[yAttr1]))
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9)
                    .style("background-color", "rgba(0, 0, 0, 0.7)");
                const xValue = d[xAttr1];
                const yValue = d[yAttr1];
                const formattedXValue = typeof xValue === 'number' && xAttr1.includes("Rate") ? d3.format(".2%")(xValue) : typeof xValue === 'number' ? d3.format(".2s")(xValue) : xValue;
                const formattedYValue = typeof yValue === 'number' && yAttr1.includes("Rate") ? d3.format(".2%")(yValue) : typeof yValue === 'number' ? d3.format(".2s")(yValue) : yValue;
                tooltip.html(`<strong>${d['Name']}</strong><br>Control: ${d['Control']}<br>Locale: ${d['Locale']}<br>${xAttr1}: ${formattedXValue}<br>${yAttr1}: ${formattedYValue}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", function (event, d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        const circles2 = g2.selectAll(".dot")
            .data(filteredData, d => d['Name'])
            .join("circle")
            .attr("class", "dot")
            .attr("r", 5)
            .style("opacity", 0.4)
            .style("fill", d => colorScale(d.Control))
            .attr("cx", d => xScale2(+d[xAttr2]))
            .attr("cy", d => yScale2(+d[yAttr2]))
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9)
                    .style("background-color", "rgba(0, 0, 0, 0.7)");
                const xValue = d[xAttr2];
                const yValue = d[yAttr2];
                const formattedXValue = typeof xValue === 'number' && xAttr2.includes("Rate") ? d3.format(".2%")(xValue) : typeof xValue === 'number' ? d3.format(".2s")(xValue) : xValue;
                const formattedYValue = typeof yValue === 'number' && yAttr2.includes("Rate") ? d3.format(".2%")(yValue) : typeof yValue === 'number' ? d3.format(".2s")(yValue) : yValue;
                tooltip.html(`<strong>${d['Name']}</strong><br>Control: ${d['Control']}<br>Locale: ${d['Locale']}<br>${xAttr2}: ${formattedXValue}<br>${yAttr2}: ${formattedYValue}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", function (event, d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });
}

xDropdown1.on("change", updateScatter);
yDropdown1.on("change", updateScatter);
xDropdown2.on("change", updateScatter);
yDropdown2.on("change", updateScatter);

backButton.on("click", function () {
    window.location.href = "page_1.html";
});

updateScatter();
