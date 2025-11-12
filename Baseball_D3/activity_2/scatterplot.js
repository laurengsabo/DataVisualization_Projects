// **** Functions to call for scaled values ****
d3.csv('baseball_hr_leaders.csv').then(function (datum) {
    function scaleYear(year) {
        return yearScale(year);
    }

    function scaleHomeruns(homeruns) {
        return hrScale(homeruns);
    }

    // **** Code for creating scales, axes and labels ****

    var yearScale = d3.scaleLinear()
        .domain([1870, 2017]).range([60, 700]);

    var hrScale = d3.scaleLinear()
        .domain([0, 75]).range([340, 20]);

    var svg = d3.select('svg');

    svg.append('g').attr('class', 'x axis')
        .attr('transform', 'translate(0,345)')
        .call(d3.axisBottom(yearScale).tickFormat(function (d) { return d; }));

    svg.append('g').attr('class', 'y axis')
        .attr('transform', 'translate(55,0)')
        .call(d3.axisLeft(hrScale));

    // **** Your JavaScript code goes here ****

    svg.append("text")
        .attr("class", "header label")
        .attr('transform', 'translate(360, 40)')
        .text("Top 10 HR Leaders per MLB Season")
        .attr('font-weight', "bold")

    svg.append("text")
        .attr("class", "x axis label")
        .attr('transform', 'translate(360, 380)')
        .text("MLB Season");

    svg.append("text")
        .attr("class", "y axis label")
        .attr('transform', 'translate(15, 190) rotate(90)')
        .text("Home Runs (HR)");

    datum.forEach(function (player) {
        createBubble(svg, scaleYear(+player['year']), scaleHomeruns(+player['homeruns']), player);

    });
});

function createBubble(svg, year, homeruns, player) {

    var colorMap = {
        "1": "goldenrod",
        "2": "goldenrod",
        "3": "goldenrod",
        "4": "lightblue",
        "5": "lightblue",
        "6": "lightblue",
        "7": "lightblue",
        "8": "lightblue",
        "9": "grey",
        "10": "grey"
    };

    var opacityMap = {
        "1": "0.5",
        "2": "0.75",
        "3": "1",
        "4": "0.5",
        "5": "0.625",
        "6": "0.75",
        "7": "0.875",
        "8": "1",
        "9": "0.5",
        "10": "1"
    };

    var circle = svg.append('circle')
        .attr('cx', year)
        .attr('cy', homeruns)
        .attr('r', '2px')
        .attr('fill', colorMap[player['rank']])
        .attr('opacity', opacityMap[player['rank']]);
}
