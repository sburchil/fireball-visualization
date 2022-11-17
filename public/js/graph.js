var impact_e = [];
var date = [];
var boxplot_div = document.getElementById("boxplot-div");
var boxplot_graph = initBoxplot();
var scatter_div = document.getElementById("scatter-div");
var scatter_graph = initScatter();
var graph_alerts = $("#graph-alerts");
var jsonData;
$(document).ready(function () {

    $('#offcanvasMenu').offcanvas({
        scroll: true,
        backdrop: false
    });
    $('#menu-toggle').click(function () {
        $('#offcanvasMenu').offcanvas('toggle');
        document.getElementById("toggle-icon").classList.toggle("rotate-icon");
    });
    $('#offcanvasMenu').on('hidden.bs.offcanvas', function () {
        $('#graph-alerts').css('right', '10px');
        $('#menu-text').animate({
            left: "-=10px"
        }, 100)
    });
    $('#offcanvasMenu').on('show.bs.offcanvas', function () {
        $('#menu-text').animate({
            left: "+=10px"
        }, 100)
        let canvas_width = $('#offcanvasMenu').width();
        $('#graph-alerts').css('right', (canvas_width + 10) + 'px');
    });

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
        var data = {
            'date-min': date_min.toISOString().split('T')[0],
            'date-max': date_max.toISOString().split('T')[0]
        }
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
                createScatterPlot();
                createBoxPlot();
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

function initBoxplot() {
    var layout = {
        title: {
            text: 'Fireball Data Boxplot',
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
        width: window.innerWidth - 50,
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
    return Plotly.newPlot(boxplot_div, [], layout);
}

//initializing graph
function initScatter() {
    var layout = {
        title: {
            text: 'Fireball Data Scatterplot',
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
        width: window.innerWidth - 50,
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
    return Plotly.newPlot(scatter_div, [], layout);
}

function createBoxPlot() {
    console.log('create boxplot');

    //get range
    boxplot_graph.then((e) => {

        //console.log(e);
        let minDate = date[0];
        let maxDate = date[0];
        date.forEach((entry) => {
            let splitDate = entry.split('-');
            if (splitDate[0] < minDate.split('-')[0] || (splitDate[1] < minDate.split('-')[1] && splitDate[0] <= minDate.split('-')[0])) {
                minDate = entry;
            }
            if (splitDate[0] > maxDate.split('-')[0] || (splitDate[1] > maxDate.split('-')[1] && splitDate[0] >= maxDate.split('-')[0])) {
                maxDate = entry;
            }
        });

        //give each entry a trace id for sorting, and assign names to traces
        let traceIds = [];
        date.forEach((entry) => {
            let splitDate = entry.split('-');
            let traceId = (12 * (splitDate[0] - minDate.split('-')[0])) + (splitDate[1] - minDate.split('-')[1]);
            traceIds.push(traceId);
        });

        //sort into traces
        let numTraces = (12 * (maxDate.split('-')[0] - minDate.split('-')[0])) + (maxDate.split('-')[1] - minDate.split('-')[1]);
        let rawTraces = [];
        for (let n = 0; n < numTraces; n++) {
            rawTraces.push([]);
        }
        for (let n = 0; n < numTraces; n++) {
            for (let i = 0; i < date.length; i++) {
                if (traceIds[i] === n) {
                    rawTraces[n].push(impact_e[i]);
                }
            }
        }

        //create traces
        let data = [];
        let count = 1;
        rawTraces.forEach((entry) => {
            let newTrace = {
                y: entry,
                type: 'box',
                name: 'Month ' + count
            }
            data.push(newTrace);
            count++;
        });

        //console.log(data);

        /* 
            add traces first, then update layout
        */
        Plotly.addTraces(boxplot_div, data);
        //lord forgive me, i know not what i do
        Plotly.animate(boxplot_div, {
            data: data,
        }, {
            transition: {
                duration: 500,
                easing: 'cubic-in-out'
            },
            frame: {
                duration: 500,
            }
        });

    })
}

//creating scatter plot
function createScatterPlot() {

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

    scatter_graph.then((e) => {
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
            Plotly.animate(scatter_div, {
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
            });
        } else {
            Plotly.addTraces(scatter_div, data);
        }

        window.addEventListener("resize", () => {
            var containerWidth = $('#scatter-graph').innerWidth();
            var containerHeight = $('#scatter-graph').innerHeight();

            //console.log($('#scatter-graph'));
            //console.log(containerWidth, containerHeight);

            Plotly.relayout(e, {
                width: window.innerWidth - 30,
                height: window.innerHeight / 1.5
            });
        });

        scatter_div.on('plotly_click', function (data) {
            var pts = [];
            for (var i = 0; i < data.points.length; i++) {
                pts.push(data.points[i].x)
                pts.push(data.points[i].y);
            }
            var newData = jsonData.filter((el) => {
                if (el.date === pts[0]) {
                    return el;
                }
            }).filter((el) => {
                if (parseFloat(el.impact_energy) === parseFloat(pts[1])) {
                    const returnString = `Date: ${el.date} <br> Impact Energy: ${el.impact_energy} kt <br> Latitude: ${el.lat} <br> Longitude: ${el.lng} <br> Velocity: ${el.vel} km/s <br>`;
                    $('.graph-data').html(returnString);
                }
            })

        });

    });
}