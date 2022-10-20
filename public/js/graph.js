var impact_e = [];
var date = [];
var graphDiv = document.getElementById("graph1");
var graph_alerts = $("#graph-alerts");
var mainGraph = initGraph();
$(document).ready(function () {

    var date_min = $('#date-min').val();
    var date_max = $('#date-max').val();
    callAjax({"date-min": date_min,"date-max": date_max});

    $("#paramForm").on("submit", (e) => {
        e.preventDefault();
        var formData = new FormData(e.target);
        var data = {};
        for (var pair of formData.entries()) {
            data[pair[0]] = pair[1];
        }
        console.log(data);
        removeAlert();
        callAjax(data);
    })
});

function callAjax(data){
    impact_e = [];
    date = [];
    $.ajax({
        url: "/graphs/request",
        type: "GET",
        data: data,
        success: (data) => {
            const parsedData = JSON.parse(data);
            if(parsedData.count > 0){
                const jsonData = setRequestedData(parsedData);
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
            }else {
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
function initGraph(){
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
        width: window.innerWidth -30,
        height: window.innerHeight/1.5,
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


function createGraph(){
    var trace1 = {
        x: date,
        y: impact_e,
        name: 'Impact Energy',
        mode: 'markers',
        type: "scatter",
        marker: {size:12},
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
        if(e.data.length > 0){
            var startDate = new Date($("#date-min").val());
            var endDate = new Date($("#date-max").val());
            if(endDate.getFullYear() - startDate.getFullYear() > 7){
                range = [];
                startDate.setFullYear(startDate.getFullYear()-1);
                endDate.setFullYear(endDate.getFullYear()+1);
                range.push(startDate.toISOString().split("T")[0]);
                range.push(endDate.toISOString().split("T")[0]);
            } else {
                range = [];
                range.push($("#date-min").val());
                range.push($("#date-max").val());
            }
            console.log(range);
            Plotly.animate(graphDiv, {
                data: data,
                traces: [0],
                layout: {
                    xaxis: {
                        range: range
                    },
                    yaxis: {
                        range: [impact_e[0]-1, impact_e[impact_e.length - 1]+1]
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
            console.log("adding");
            Plotly.addTraces(graphDiv, data);
        }
        console.log(mainGraph);
        window.addEventListener("resize", () => {
            Plotly.relayout(e, {
                width: window.innerWidth - 30,
                height: window.innerHeight/1.5
            });
        });
    });
    
}
