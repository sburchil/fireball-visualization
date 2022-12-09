var impact_e = [];
var date = [];
var filtered_impact_e = [];
var filtered_date = [];
var boxplot_div = document.getElementById('boxplot-div')
var boxplot_graph = initGraph('boxplot')
var scatter_div = document.getElementById('scatter-div')
var scatter_graph = initGraph('scatter')
var linegraph_div = document.getElementById('linegraph-div')
var linegraph_graph = initGraph('linegraph')
var graph_alerts = $('#graph-alerts')
var jsonData;
var filteredData;

var $ = jQuery.noConflict();

$(document).ready(function () {
  $('#offcanvasMenu').offcanvas({
    scroll: true,
    backdrop: false
  })
  let dateDropdown = document.getElementById('datepicker'); 
       
  let currentYear = 2022;    
  let earliestYear = 1988;     
  while (currentYear >= earliestYear) {      
    let date = document.createElement('option');          
    date.text = currentYear;      
    date.value = currentYear;        
    dateDropdown.add(date);      
    currentYear -= 1;    
  }
  $('#menu-toggle').click(function () {
    $('#offcanvasMenu').offcanvas('toggle')
    document.getElementById('toggle-icon').classList.toggle('rotate-icon')
  })
  $('#offcanvasMenu').on('hidden.bs.offcanvas', function () {
    $('#graph-alerts').css('right', '10px')
    $('#menu-text').animate(
      {
        left: '-=10px'
      },
      100
    )
  })
  $('#offcanvasMenu').on('show.bs.offcanvas', function () {
    $('#menu-text').animate(
      {
        left: '+=10px'
      },
      100
    )
    let canvas_width = $('#offcanvasMenu').width()
    $('#graph-alerts').css('right', canvas_width + 10 + 'px')
  })

  var date_min1 = $('#date-min').val()
  var date_max1 = $('#date-max').val()

  callAjax({ 'date-min': date_min1, 'date-max': date_max1, 'sort': 'impact-e' }, )
  callAjaxForDateSorting({ 'date-min': date_min1, 'date-max': date_max1, 'sort': 'date' }, )
})

$('#paramForm').on('submit', e => {
    e.preventDefault()

    //removes the error messages from the previous form submission
    $('#date-min').removeClass('is-invalid')
    $('#date-max').removeClass('is-invalid')
    $('#date-help').text('')

    //gets the start and end dates from the current form
    var date_min = new Date(e.target[0].value)
    var date_max = new Date(e.target[1].value)

    //calculates the difference between the start and end dates in months
    var diff_time = Math.abs(date_max - date_min)
    var diff_month = (diff_time / (1000 * 3600 * 24 * 30)).toFixed(1)

    /*if the start date is after the end date, 
    the form is not submitted and an error message is displayed */
    if (date_min > date_max) {
      $('#date-min').addClass('is-invalid')
      $('#date-help').attr('class', 'text-danger')
      $('#date-help').text('Start date must be before end date.')
      return removeAlert()

      /*if the start and end dates are the same, 
      the form is not submitted and an error message is displayed*/
    } else if (date_min.toString() === date_max.toString()) {
      $('#date-min').addClass('is-invalid')
      $('#date-max').addClass('is-invalid')
      $('#date-help').attr('class', 'text-danger')
      $('#date-help').text('Dates cannot be the same.')
      return removeAlert()

      /*if the start or end dates are in the future, 
      the form is not submitted and an error message is displayed*/
    } else if (date_min > new Date() || date_max > new Date()) {
      $('#date-help').attr('class', 'text-success')
      $('#date-help').text('Dates are invalid. They cannot be in the future.')
      return removeAlert()

        /*if the difference between the start and end dates is greater than 6 months,
        the form is not submitted and an error message is displayed
        only if the box plot tab is active*/
    } 

    //if the line graph tab is active, the line graph is updated
    if($('#lineGraph-tab').hasClass('active')) {
        var data = {
            'date-min': date_min.toISOString().split('T')[0],
            'date-max': date_max.toISOString().split('T')[0],
            'sort': 'date'
          }
        callAjaxForDateSorting(data)

        //if the line graph tab is not, the other active graphs are updated
    } else if($('#boxPlot-tab').hasClass('active')){
          if($('#datepicker').val() == null) {
            $('#date-help').attr('class', 'text-danger')
            $('#date-help').text('Please select a year.')
            return removeAlert()
          } else {
            let date_min = new Date($('#datepicker').val(), 0, 1)
            let date_max = new Date($('#datepicker').val(), 11, 31)
            var data = {
              'date-min': date_min.toISOString().split('T')[0],
              'date-max': date_max.toISOString().split('T')[0],
              'sort': 'date'
            }
            return callAjaxForDateSorting(data);
          }
    } else {
        var data = {
            'date-min': date_min.toISOString().split('T')[0],
            'date-max': date_max.toISOString().split('T')[0],
            'sort': 'impact-e'
          }
        callAjax(data)
    }
  })


//function used to populate scatter plot and box plot
function callAjax (data) {
    //emptying the arrays to prevent duplicate data
  impact_e = []
  date = []
  $.ajax({
    url: '/graphs/request',
    type: 'GET',
    data: data,
    //if the request is successful, the data is parsed and the arrays are populated
    success: data => {
      const parsedData = JSON.parse(data.jsonData)
      if (parsedData.count > 0) {
        jsonData = setRequestedData(parsedData)
        jsonData.forEach(el => {
          impact_e.push(parseFloat(el.impact_energy))
          date.push(el.date)
        })
        //the arrays are sorted in ascending order by impact energy
        createScatterPlot();
        //the alert is removed and a new one is created
        sleep(100).then(() => {
            showAlert(
                {
                    class: 'success',
                    message: parsedData.count + ' results returned.'
                },
                graph_alerts
                )
            })
        } else {
            showAlert(
                {
                    class: 'danger',
                    message: 'No results returned. Try different search parameters.'
                },
                graph_alerts
                )
            }
    },
    error: (xhr, status, error) => {
      console.log(error)
    }
  })
}

//function used to populate line graph
function callAjaxForDateSorting (data) {
    //emptying the arrays to prevent duplicate data
    filtered_impact_e = []
    filtered_date = []
    $.ajax({
      url: '/graphs/request',
      type: 'GET',
      data: data,
      //if the request is successful, the data is parsed and the arrays are populated
      success: data => {
        const date_filtered = JSON.parse(data.jsonData);
        if(date_filtered.count > 0){
        
            filteredData = setRequestedData(date_filtered);
            filteredData.forEach(el => {
                filtered_impact_e.push(parseFloat(el.impact_energy))
                filtered_date.push(el.date)
            })
            //the arrays are sorted in ascending order by date
            createLineGraph();
            createBoxPlot2();

          } 
      error: (xhr, status, error) => {
        console.log(error)
      }
    }
  })
}

  //function used to initialize the graphs upon page load for faster loading
function initGraph (graph) {
  var graph_string

  //determins which graph is currently being initialized
  if (graph == 'boxplot') {
    graph_string = 'Boxplot'
  } else if (graph == 'scatter') {
    graph_string = 'Scatter Plot'
  } else if (graph == 'linegraph') {
    graph_string = 'Line Graph'
  }

  //creates the layout for the graph
  var layout = {
    title: {
      text: 'Fireball Data ' + graph_string,
      font: {
        family: 'Times New Roman',
        size: 18,
        color: 'white'
      }
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
    plot_bgcolor: 'rgba(0,0,0,0)'
  }

  //creates the graph based on the current graph type
  if (graph == 'boxplot') {
    return Plotly.newPlot(boxplot_div, [], layout)
  } else if (graph == 'scatter') {
    return Plotly.newPlot(scatter_div, [], layout)
  } else if (graph == 'linegraph') {
    return Plotly.newPlot(linegraph_div, [], layout)
  } else {
    console.log('Error: Invalid graph type.')
  }
}

//function used to create the box plot
function createBoxPlot2 () {

  let traces = [[], [], [], [], [], [], [], [], [], [], [], []];

  //creates the traces for each month
  for (let i = 0; i < filtered_date.length; i++) {
    let splitDate = filtered_date[i].split('-');
    let month = parseInt(splitDate[1]);
    traces[month - 1].push(filtered_impact_e[i]);
  }

  console.log(traces);

var data =[];
var count = 0;
traces.forEach( el => {

  var date = new Date(1111, count, 1);
  var month = date.toLocaleString('default', { month: 'long' });

  console.log(month)

    data.push({
        y: el,
        type: 'box',
        name: month
    })
    count++;
})

boxplot_graph.then(e => {
    console.log(e.data.length);
    if (e.data.length > 0) {
      Plotly.animate(boxplot_div, {
        data: data,
        traces: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        layout: {}
      })
    } else {
      Plotly.addTraces(boxplot_div, data)
    }

    window.addEventListener('resize', () => {

        Plotly.relayout(e, {
          width: window.innerWidth - 30,
          height: window.innerHeight / 1.5
        })
      })
    //lord forgive me, i know not what i do
  })


}

function createBoxPlot () {
  //get range
  let minDate = filtered_date[0]
  let maxDate = filtered_date[0]


  //find min and max date
  filtered_date.forEach(entry => {
      let splitDate = entry.split('-')
    if (
      splitDate[0] < minDate.split('-')[0] ||
      (splitDate[1] < minDate.split('-')[1] &&
        splitDate[0] <= minDate.split('-')[0])
    ) {
      minDate = entry
    }
    if (
      splitDate[0] > maxDate.split('-')[0] ||
      (splitDate[1] > maxDate.split('-')[1] &&
        splitDate[0] >= maxDate.split('-')[0])
    ) {
      maxDate = entry
    }
  })

  //give each entry a trace id for sorting, and assign names to traces
  let traceIds = []
  filtered_date.forEach(entry => {
    let splitDate = entry.split('-')
    let traceId =
      12 * (splitDate[0] - minDate.split('-')[0]) +
      (splitDate[1] - minDate.split('-')[1])
    traceIds.push(traceId)
  })

  //sort into traces
  let numTraces = 8
  let rawTraces = []
  for (let n = 0; n < numTraces; n++) {
    rawTraces.push([])
  }
  for (let n = 0; n < numTraces; n++) {
    for (let i = 0; i < date.length; i++) {
      if (traceIds[i] >= n && traceIds[i] <= n + 1) {
        rawTraces[n].push(impact_e[i])
      }
    }
  }

  //create traces
  let data = []
  let count = 1
  rawTraces.forEach(entry => {

    let newTrace = {
      y: entry,
      type: 'box',
      name: 'Month  ' + count,
    }
    data.push(newTrace)
    count++
  })

  /* 
        add traces first, then update layout if graph is already created
        */

  boxplot_graph.then(e => {
    console.log(e.data.length);
    if (e.data.length > 0) {
      Plotly.animate(boxplot_div, {
        data: data,
        traces: [0],
        layout: {}
      })
    } else {
      Plotly.addTraces(boxplot_div, data)
    }

    window.addEventListener('resize', () => {

        Plotly.relayout(e, {
          width: window.innerWidth - 30,
          height: window.innerHeight / 1.5
        })
      })
    //lord forgive me, i know not what i do
  })
}

//creating scatter plot
function createScatterPlot () {
  var trace1 = {
    x: date,
    y: impact_e,
    name: 'Impact Energy',
    mode: 'markers',
    type: 'scatter',
    marker: { size: 12 },
    textfont: {
      family: 'Times New Roman',
      size: 14,
      color: 'white'
    }
  }

  var data = [trace1]

  //add traces first, then update layout if graph is already created
  scatter_graph.then(e => {
    var range = []
    if (e.data.length > 0) {
        //fixes the range of the x axis if the range is too large to show all data
      var startDate = new Date($('#date-min').val())
      var endDate = new Date($('#date-max').val())
      if (endDate.getFullYear() - startDate.getFullYear() > 7) {
        range = []
        startDate.setFullYear(startDate.getFullYear() - 1)
        endDate.setFullYear(endDate.getFullYear() + 1)
        range.push(startDate.toISOString().split('T')[0])
        range.push(endDate.toISOString().split('T')[0])
      } else {
        range = []
        range.push($('#date-min').val())
        range.push($('#date-max').val())
      }

      //updates the graph
      Plotly.animate(
        scatter_div,
        {
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
        },
        {
          transition: {
            duration: 500,
            easing: 'cubic-in-out'
          },
          frame: {
            duration: 500
          }
        }
      )
    } else {
        //if the graph is not populated, add the traces
      Plotly.addTraces(scatter_div, data)
    }

    //resize the graph on window resize
    window.addEventListener('resize', () => {
      Plotly.relayout(e, {
        width: window.innerWidth - 30,
        height: window.innerHeight / 1.5
      })
    })

    //add click event to graph to show current data point
    scatter_div.on('plotly_click', function (data) {
      var pts = []
      for (var i = 0; i < data.points.length; i++) {
        pts.push(data.points[i].x)
        pts.push(data.points[i].y)
      }
      var newData = jsonData
        .filter(el => {
          if (el.date === pts[0]) {
            return el
          }
        })
        .filter(el => {
          if (parseFloat(el.impact_energy) === parseFloat(pts[1])) {
            const returnString = `Date: ${el.date} <br> Impact Energy: ${el.impact_energy} kt <br> Latitude: ${el.lat} <br> Longitude: ${el.lng} <br> Velocity: ${el.vel} km/s <br>`
            $('.graph-data').html(returnString)
          }
        })
    })
  })
}

//creating line graph
function createLineGraph () {
    /* 
        creating a min x and max x value to set the range of the x axis
        for large data selections
    */
    var min_x = new Date(filteredData[0].date);
    min_x.setMonth(min_x.getMonth() - 2);
    var max_x = new Date(filteredData[filteredData.length - 1].date);
    max_x.setMonth(max_x.getMonth() + 2);
    var rangeX = [min_x.toISOString().split('T')[0], max_x.toISOString().split('T')[0]];


    var trace = {
        x: filtered_date,
        y: filtered_impact_e.length,
        mode: 'lines+markers'
    }

    var layout = {
        xaxis: {
            range: [rangeX[0], rangeX[1]]
        },
    }

    var data = [trace];
   
    //add traces first, then update layout if graph is already created
    linegraph_graph.then(e => {
        if(e.data.length > 0){
            console.log(rangeX);
            
            Plotly.animate(linegraph_div, {
                data: data,
                traces: [0],
                layout: layout,
                autorange: true
            },
            {
              transition: {
                duration: 500,
                easing: 'cubic-in-out'
              },
              frame: {
                duration: 500
              }
            }
            )
        } else {
            Plotly.addTraces(linegraph_div, data);
        }

        //resize the graph on window resize
        window.addEventListener('resize', () => {
            Plotly.relayout(e, {
              width: window.innerWidth - 30,
              height: window.innerHeight / 1.5
            })
          })
    })


}