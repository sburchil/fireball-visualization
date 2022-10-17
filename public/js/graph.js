var impact_e = [];
var energy = [];
$(document).ready(function () {
    $.ajax({
        url: "/graphs/request",
        type: "GET",
        data: {},
        success: (data) => {
            const jsonData = setRequestedData(JSON.parse(data));
            jsonData.forEach((el) => {
                impact_e.push(parseFloat(el.impact_energy));
                energy.push(parseFloat(el.energy));
            });
        },
        error: (xhr, status, error) => {
            console.log(error);
        }
    })
});

var layout = {
    title: {
        text: 'Fireball Data',
        font: {
            family: 'Courier New, monospace',
            color: 'white'
        },
    },
    font: {
        family: 'Courier New, monospace',
        color: 'white'
    },
    width: window.innerWidth -30,
    height: window.innerHeight/2,
    margin: {
        pad: 20
    },
    showlegend: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
};
var trace1 = {
    x: impact_e,
    y: energy,
    mode: 'lines+markers',
    type: "scatter"
}
var data = [trace1];
var out = Plotly.validate("graph1", data, layout);
console.log(out);
var mainGraph = Plotly.newPlot("graph1", data, layout);

console.log(mainGraph);

mainGraph.then((e) => {
    window.addEventListener("resize", () => {
        console.log(e.data);
        Plotly.relayout(e, {
            width: window.innerWidth - 30
        });
    });
});
