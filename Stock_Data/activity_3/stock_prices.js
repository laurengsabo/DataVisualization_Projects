// **** Example of how to create padding and spacing for trellis plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the trellis subplots
var padding = { t: 20, r: 20, b: 60, l: 60 };

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
trellisWidth = svgWidth / 2 - padding.l - padding.r;
trellisHeight = svgHeight / 2 - padding.t - padding.b;

// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'C']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function (d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate(' + [tx, ty] + ')';
    });

var parseDate = d3.timeParse('%b %Y');
// To speed things up, we have already computed the domains for your scales
var dateDomain = [new Date(2000, 0), new Date(2010, 2)];
var priceDomain = [0, 223.02];

// **** How to properly load data ****

d3.csv('stock_prices.csv').then(function (dataset) {

    // **** Your JavaScript code goes here ****

    dataset.forEach(d => {
        d.date = parseDate(d.date);
        d.price = +d.price;
    });

    var nestData = Array.from(d3.group(dataset, d => d.company), ([key, values]) => ({ key, values }));

    var trellisGroupings = svg.selectAll('.trellis').data(nestData).enter()
        .append('g')
        .attr('class', 'trellis')
        .attr('transform', function (d, i) {
            var trellisX = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
            var trellisY = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
            return 'translate(' + [trellisX, trellisY] + ')';
        });

    var xScale = d3.scaleTime()
        .domain(dateDomain)
        .range([0, trellisWidth]);

    var yScale = d3.scaleLinear()
        .domain(priceDomain)
        .range([trellisHeight, 0]);

    var lineInterpolate = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.price));

    var colors = d3.scaleOrdinal(d3.schemeDark2).domain(nestData.map(d => d.key));

    trellisGroupings.each(function (d) {
        d3.select(this).append('path').datum(d.values)
            .attr('class', 'line-plot')
            .attr('fill', 'none')
            .style('stroke', colors(d.key))
            .attr('stroke-width', 4)
            .attr('d', lineInterpolate);
    });

    trellisGroupings.append('text')
        .text(d => d.key)
        .attr('class', 'company-label')
        .attr('x', trellisWidth / 2)
        .attr('y', trellisHeight / 2)
        .attr('fill', d => colors(d.key));

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    var xGrid = d3.axisTop(xScale)
        .tickSize(-trellisHeight, 0, 0)
        .tickFormat('');

    var yGrid = d3.axisLeft(yScale)
        .tickSize(-trellisWidth, 0, 0)
        .tickFormat('');

    trellisGroupings.append('g')
        .attr('class', 'grid')
        .call(xGrid)

    trellisGroupings.append('g')
        .attr('class', 'grid')
        .call(yGrid)

    trellisGroupings.append('g')
        .attr('class', 'axis')
        .call(yAxis);

    trellisGroupings.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${trellisHeight})`)
        .call(xAxis);

    trellisGroupings.append('text')
        .text('Date (by Month)')
        .attr('class', 'axis-label')
        .attr('x', trellisWidth / 2)
        .attr('y', trellisHeight + 35);

    trellisGroupings.append('text')
        .text('Stock Price (USD)')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -trellisWidth / 2 + 15)
        .attr('y', -30);

    console.log(nestData);
});

// Remember code outside of the data callback function will run before the data loads