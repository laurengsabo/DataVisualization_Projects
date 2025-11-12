var svg = d3.select("svg");

// Dimensions and Margin
var margin = { top: 40, right: 60, bottom: 60, left: 60 };
var width = +svg.attr("width") - margin.left - margin.right;
var height = +svg.attr("height") - margin.top - margin.bottom;

// Widths
var scatterWidth = width * 0.5;
var barChartWidth = width * 0.5;

// chartG and barChartG
var chartG = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var barChartG = svg.append("g")
    .attr("transform", "translate(" + (margin.left + scatterWidth + 50) + "," + margin.top + ")");

var dataAttributes = ["time played (hours)", "goals scored", "goals conceded", "age"];

// Scales (specify the bar chart one...)
var xScale = d3.scaleLinear().range([0, scatterWidth]);
var yScale = d3.scaleLinear().range([height, 0]);
var barXScale = d3.scaleBand().range([0, barChartWidth]).padding(0.1);
var barYScale = d3.scaleLinear().range([height, 0]);

// Axes (specify the bar chart one...)
var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale);
var barXAxis = d3.axisBottom(barXScale);
var barYAxis = d3.axisLeft(barYScale);

// Dropdowns
var dropdownContainer = d3.select("body")
    .append("div")
    .style("margin-bottom", "20px");

dropdownContainer.append("label")
    .text("X-Axis: ")
    .style("margin-right", "10px")
    .style("margin-left", "20px");

var xDropdown = dropdownContainer.append("select")
    .style("margin-right", "40px");

dropdownContainer.append("label")
    .text("Y-Axis: ")
    .style("margin-right", "10px");

var yDropdown = dropdownContainer.append("select");

dataAttributes.forEach(attr => {
    xDropdown.append("option")
        .text(attr)
        .attr("value", attr);
    yDropdown.append("option")
        .text(attr)
        .attr("value", attr);
});

xDropdown.property("value", "age");
yDropdown.property("value", "time played (hours)");

// Axes
chartG.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

chartG.append("g")
    .attr("class", "y axis");

barChartG.append("g")
    .attr("class", "bar-x axis")
    .attr("transform", "translate(0," + height + ")");

barChartG.append("g")
    .attr("class", "bar-y axis");

// Axis Titles and Graph Titles
// Scatterplot Labels
svg.append("text")
    .attr("class", "title")
    .attr("x", width / 4)
    .attr("y", 20)
    .style("text-anchor", "middle")
    .text("Customizable Scatterplot");

svg.append("text")
    .attr("class", "x label")
    .attr("x", width / 4)
    .attr("y", height + margin.top + 40)
    .style("text-anchor", "middle");

svg.append("text")
    .attr("class", "y label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2 - margin.top)
    .attr("y", margin.left - 40)
    .style("text-anchor", "middle");

// Bar Chart Labels
barChartG.append("text")
    .attr("class", "title")
    .attr("x", barChartWidth / 2)
    .attr("y", -20)
    .style("text-anchor", "middle")
    .text("Count of Players vs Age");

barChartG.append("text")
    .attr("class", "title")
    .attr("x", barChartWidth / 2)
    .attr("y", height + 40)
    .style("text-anchor", "middle")
    .text("age");

barChartG.append("text")
    .attr("class", "title")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -30)
    .style("text-anchor", "middle")
    .text("Count of Players");

// Load data!!!
d3.csv("epl_players.csv", dataPreprocessor).then(function (data) {

    let xAttr = xDropdown.property("value");
    let yAttr = yDropdown.property("value");

    function updatePlot() {
        xAttr = xDropdown.property("value");
        yAttr = yDropdown.property("value");

        xScale.domain(d3.extent(data, d => d[xAttr]));
        yScale.domain(d3.extent(data, d => d[yAttr]));

        chartG.select(".x.axis").call(xAxis);
        chartG.select(".y.axis").call(yAxis);

        svg.select(".x.label").text(xAttr);
        svg.select(".y.label").text(yAttr);

        var dots = chartG.selectAll(".dot").data(data);

        dots.enter().append("circle")
            .attr("class", "dot")
            .attr("r", 4)
            .merge(dots)
            .attr("cx", d => xScale(d[xAttr]))
            .attr("cy", d => yScale(d[yAttr]))
            .style("fill", "#808080"); // INITIAL GREY!!!

        dots.exit().remove();

        chartG.select(".brush").call(scatterPlotBrush.move, null);

        updateBarChart(data);
    }


    function updateBarChart(filtData) {
        var countData = d3.rollups(filtData, v => v.length, d => d.age)
            .map(([key, value]) => ({ key, value }))
            .sort((a, b) => a.key - b.key);

        barXScale.domain(countData.map(d => d.key));
        barYScale.domain([0, d3.max(countData, d => d.value)]);

        barChartG.select(".bar-x.axis").call(barXAxis);
        barChartG.select(".bar-y.axis").call(barYAxis);

        var bars = barChartG.selectAll(".bar").data(countData);

        bars.enter().append("rect")
            .attr("class", "bar")
            .merge(bars)
            .attr("x", d => barXScale(d.key))
            .attr("y", d => barYScale(d.value))
            .attr("width", barXScale.bandwidth())
            .attr("height", d => height - barYScale(d.value))
            .attr("fill", "#808080"); // INTIAL GREY!!!

        bars.exit().remove();
    }

    // Scatterplot Brushing
    var scatterPlotBrush = d3.brush()
        .extent([[0, 0], [scatterWidth, height]])
        .on("brush end", brushedScatterPlot);

    chartG.append("g")
        .attr("class", "brush")
        .call(scatterPlotBrush);

    function brushedScatterPlot(event) {
        if (!event.selection) {
            barChartG.selectAll(".bar")
                .attr("fill", "#808080");
            chartG.selectAll(".dot")
                .style("fill", "#808080");
            return;
        }

        const [[x0, y0], [x1, y1]] = event.selection;

        var selectedData = data.filter(d => {
            let cx = xScale(d[xAttr]);
            let cy = yScale(d[yAttr]);
            return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
        });

        var selectedDataIds = selectedData.map(d => d.name);

        chartG.selectAll(".dot")
            .style("fill", d => selectedDataIds.includes(d.name) ? "red" : "#808080"); // CHANGE TO RED!!

        var selectedAges = selectedData.map(d => d.age);

        barChartG.selectAll(".bar")
            .attr("fill", function (d) {
                return selectedAges.includes(d.key) ? "red" : "#808080"; // CHANGE TO RED!!
            });
    }


    // Bar Chart Brushing
    var barChartBrush = d3.brushX()
        .extent([[0, 0], [barChartWidth, height]])
        .on("brush end", brushedBarChart);

    barChartG.append("g")
        .attr("class", "brush")
        .call(barChartBrush);

    function brushedBarChart(event) {
        if (!event.selection) {
            chartG.selectAll(".dot")
                .style("fill", "#808080"); // INTIIAL GREY!!
            barChartG.selectAll(".bar")
                .attr("fill", "#808080"); // INITIAL GREY!!!
            return;
        }

        const [x0, x1] = event.selection;

        var selectedAges = data.filter(d => {
            let cx = barXScale(d.age);
            return cx >= x0 && cx <= x1;
        }).map(d => d.age);

        barChartG.selectAll(".bar")
            .attr("fill", d => selectedAges.includes(d.key) ? "red" : "#808080");

        chartG.selectAll(".dot")
            .style("fill", d => selectedAges.includes(d.age) ? "red" : "#808080");
    }

    xDropdown.on("change", updatePlot);
    yDropdown.on("change", updatePlot);

    updatePlot();
});

function dataPreprocessor(row) {
    return {
        'name': row['name'],
        'age': +row['age'],
        'position': row['position'],
        'time played (hours)': parseFloat(row['time played (hours)']),
        'goals scored': +row['goals scored'],
        'assists': +row['assists'],
        'goals conceded': +row['goals conceded'],
        'yellow cards': +row['yellow cards']
    };
}
