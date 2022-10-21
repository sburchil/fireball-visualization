var impact_e = [];
var date = [];
var graphDiv = document.getElementById("graph1");
var graph_alerts = $("#graph-alerts");
var mainGraph = initGraph();
var jsonData;
$(document).ready(function () {

    var date_min1 = $('#date-min').val();
    var date_max1 = $('#date-max').val();
    callAjax({ "date-min": date_min1, "date-max": date_max1 });

    $("#paramForm").on("submit", (e) => {
        e.preventDefault();

        $('#date-min').removeClass('is-invalid');
        $('#date-max').removeClass('is-invalid');
        $('#date-help').text('');

        var date_min = new Date(e.target[0].value);
        var date_max = new Date(e.target[1].value);
        if ((date_min > date_max)) {
            $('#date-min').addClass('is-invalid');
            $("#date-help").attr("class", "text-danger");
            $('#date-help').text("Start date must be before end date.");
            return removeAlert();
        } else if ((date_min.toString() === date_max.toString())) {
            $('#date-min').addClass('is-invalid');
            $('#date-max').addClass('is-invalid');
            $("#date-help").attr("class", "text-danger");
            $('#date-help').text("Dates cannot be the same.");
            return removeAlert();
        } else if ((date_min > new Date()) || (date_max > new Date())) {
            $("#date-help").attr("class", "text-success");
            $('#date-help').text("Dates are invalid. They cannot be in the future.");
            return removeAlert();
        }
        var formData = new FormData(e.target);
        var data = {};
        for (var pair of formData.entries()) {
            data[pair[0]] = pair[1];
        }
        removeAlert();
        callAjax(data);
    })

});

function callAjax(data) {
    impact_e = [];
    date = [];
    $.ajax({
        url: "/graphs/request",
        type: "GET",
        data: data,
        success: (data) => {
            const parsedData = JSON.parse(data);
            if (parsedData.count > 0) {
                jsonData = setRequestedData(parsedData);
                jsonData.forEach((el) => {
                    impact_e.push(parseFloat(el.impact_energy));
                    date.push(el.date);
                });
                createGraph();
                sleep(100).then(() => {
                    showAlert({
                        class: "success",
                        message: parsedData.count + " results returned.",
                    }, graph_alerts);
                });
            } else {
                showAlert({
                    class: "danger",
                    message: "No results returned. Try different search parameters.",
                }, graph_alerts);
            }
        },
        error: (xhr, status, error) => {
            console.log(error);
        }
    })
}
function initGraph() {
    var layout = {
        title: {
            text: 'Fireball Data',
            font: {
                family: 'Times New Roman',
                size: 18,
                color: 'white'
            },
        },
        font: {
            family: 'Times New Roman',
            size: 14,
            color: 'white'
        },
        width: window.innerWidth - 30,
        height: window.innerHeight / 1.5,
        margin: {
            pad: 20
        },
        xaxis: {
            title: 'Date of Atomosphere Entry',
            titlefont: {
                family: 'Times New Roman',
                size: 18,
                color: 'white'
            },
            tickfont: {
                family: 'Times New Roman',
                size: 14,
                color: 'white'
            }
        },
        yaxis: {
            title: 'Impact Energy (kt)',
            titlefont: {
                family: 'Times New Roman',
                size: 18,
                color: 'white'
            },
            tickfont: {
                family: 'Times New Roman',
                size: 14,
                color: 'white'
            }
        },
        showlegend: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
    };
    return Plotly.newPlot(graphDiv, [], layout);
}


function createGraph() {
    var trace1 = {
        x: date,
        y: impact_e,
        name: 'Impact Energy',
        mode: 'markers',
        type: "scatter",
        marker: { size: 12 },
        textfont: {
            family: 'Times New Roman',
            size: 14,
            color: 'white'
        },

    }
    var data = [trace1];
    // Plotly.extendTraces("graph1", data, 0);
    mainGraph.then((e) => {
        var range = [];
        if (e.data.length > 0) {
            var startDate = new Date($("#date-min").val());
            var endDate = new Date($("#date-max").val());
            if (endDate.getFullYear() - startDate.getFullYear() > 7) {
                range = [];
                startDate.setFullYear(startDate.getFullYear() - 1);
                endDate.setFullYear(endDate.getFullYear() + 1);
                range.push(startDate.toISOString().split("T")[0]);
                range.push(endDate.toISOString().split("T")[0]);
            } else {
                range = [];
                range.push($("#date-min").val());
                range.push($("#date-max").val());
            }
            Plotly.animate(graphDiv, {
                data: data,
                traces: [0],
                layout: {
                    xaxis: {
                        range: range
                    },
                    yaxis: {
                        range: [impact_e[0] - 1, impact_e[impact_e.length - 1] + 1]
                    }
                },
                autorange: true
            }, {
                transition: {
                    duration: 500,
                    easing: 'cubic-in-out'
                },
                frame: {
                    duration: 500,
                }
            })

        } else {
            Plotly.addTraces(graphDiv, data);
        }
        window.addEventListener("resize", () => {
            Plotly.relayout(e, {
                width: window.innerWidth - 30,
                height: window.innerHeight / 1.5
            });
        });

        graphDiv.on('plotly_click', (pt) => {
            var pts = [];
            for (var i = 0; i < pt.points.length; i++) {
                pts.push(pt.points[i].x);
                pts.push(pt.points[i].y.toPrecision(4)) 
            }
            var new_data = [];
            console.log(pts);
            jsonData.filter((data) => {
                // console.log(pts[0]);
                // console.log(data.date);
                console.log((data.date === pts[0]))
                if((data.date === pts[0])){
                    console.log('did it')
                    new_data.push(data);
                }

                //filter new_data for impacta-energy
                
            })
            console.log(new_data);
            // console.log('Closest point clicked', pts);

        });
    });

}
