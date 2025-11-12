function updateCircles(letters) {
    var letter = d3.select('svg').selectAll('.letter')
        .data(letters);

    var letterEnter = letter.enter()
        .append('g')
        .attr('class', 'letter');

    letterEnter.merge(letter)
        .attr('transform', function (d, i) {
            return 'translate(' + [i * 60 + 50, 50] + ')';
        });

    letterEnter.append('circle')
        .attr('r', 20);

    letterEnter.append('text')
        .attr('y', 30)
        .text(function (d) {
            return d;
        });

    letter.exit().remove();
}

updateCircles(['A', 'B', 'C']);
updateCircles(['A', 'B']);
updateCircles(['A', 'B', 'C', 'D', 'E', 'F']);