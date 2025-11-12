d3.csv('baseball_hr_leaders_2017.csv').then(function (data) {
    data.forEach(d => {
        d.name = d.name.trim();
        d.rank = d.rank.trim();
        d.year = d.year.trim();
        d.homeruns = d.homeruns.trim();
    });

    const container = d3.select("#homerun-leaders");

    container.selectAll("p")
        .data(data)
        .enter()
        .append("p")
        .text(d => `${d.rank}. ${d.name} with ${d.homeruns} home runs`)
        .attr("class", d => d.rank <= 3 ? "podium" : "");


    const table_container = d3.select("#homerun-table tbody");

    const rows = table_container.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    rows.append("td").text(d => d.rank);
    rows.append("td").text(d => d.name);
    rows.append("td").text(d => d.homeruns);

}).catch(error => console.error("Error loading CSV:", error));
