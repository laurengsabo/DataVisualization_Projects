// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    // Get current value of select element
    var category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of letters
    updateChart(category);
}

// Recall that when data is loaded into memory, numbers are loaded as Strings
// This function converts numbers into Strings during data preprocessing
function dataPreprocessor(row) {
    return {
        letter: row.letter,
        frequency: +row.frequency
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = { t: 60, r: 40, b: 30, l: 40 };

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate(' + [padding.l, padding.t] + ')');

// Compute the spacing for bar bands based on all 26 letters
var barBand = chartHeight / 26;
var barHeight = barBand * 0.7;

// A map with arrays for each category of letter sets
var lettersMap = {
    'only-consonants': 'BCDFGHJKLMNPQRSTVWXZ'.split(''),
    'only-vowels': 'AEIOUY'.split(''),
    'all-letters': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
};

var cutOff = 0;

var main = document.getElementById('main');

d3.select(main)
    .append('p')
    .append('button')
    .style("border", "1px solid black")
    .text('Filter Data')
    .on('click', function () {
        cutOff = +document.getElementById('cutoff').value;
        updateChart('all-letters');
    });

var letters = [];

d3.csv('letter_freq.csv', dataPreprocessor).then(function (dataset) {
    // Create global variables here and intialize the chart

    letters = dataset;

    // **** Your JavaScript code goes here ****

    svg.append("text")
        .attr("class", "chart-title")
        .attr("text-anchor", "middle")
        .text("Letter Frequency (%)")
        .attr("x", svgWidth / 2)
        .attr("y", padding.t / 2);

    xScale = d3.scaleLinear()
        .range([0, chartWidth])
        .domain([0, d3.max(letters, d => d.frequency)]);

    var xBottom = d3.axisBottom(xScale)
        .ticks(6)
        .tickFormat(d => (d * 100) + "%");

    chartG.append("g")
        .call(xBottom)
        .attr("class", "axis-label")
        .attr("transform", `translate(0, ${chartHeight})`);

    var xTop = d3.axisTop(xScale)
        .ticks(6)
        .tickFormat(d => (d * 100) + "%");

    chartG.append("g")
        .call(xTop)
        .attr("class", "axis-label")
        .attr("transform", `translate(0, -2)`);

    // Update the chart for all letters to initialize
    updateChart('all-letters');
});


function updateChart(filterKey) {
    // Create a filtered array of letters based on the filterKey
    var filteredLetters = letters.filter(function (d) {
        return lettersMap[filterKey].indexOf(d.letter) >= 0 && d.frequency >= cutOff / 100;
    });

    // **** Draw and Update your chart here ****

    var bars = chartG.selectAll('.bar')
        .data(filteredLetters, d => d.letter);

    bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', (d, i) => i * barBand)
        .attr('height', barHeight)
        .attr('width', d => xScale(d.frequency))
        .attr('fill', 'black')
        .merge(bars)
        .attr('width', d => xScale(d.frequency))
        .attr('y', (d, i) => i * barBand)
        .attr('height', barHeight);

    bars.exit().remove();

    var letterLabels = chartG.selectAll('.letter-label')
        .data(filteredLetters, d => d.letter);

    letterLabels.enter()
        .append('text')
        .attr('class', 'letter-label')
        .attr('x', -17)
        .attr('y', (d, i) => i * barBand + barHeight / 2)
        .text(d => d.letter)
        .merge(letterLabels)
        .attr('y', (d, i) => i * barBand + barHeight / 2);

    letterLabels.exit().remove();
}

// Remember code outside of the data callback function will run before the data loads