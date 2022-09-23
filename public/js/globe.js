require([
    "esri/config",
    "esri/Map",
    "esri/views/SceneView",
    "esri/layers/CSVLayer",
    "esri/layers/support/LabelClass",
], function(esriConfig,Map, SceneView, CSVLayer, LabelClass) {
  esriConfig.apiKey = "AAPKf83999834a67470c91f540a72a98c5b8B1qaM9X_z-C-rB5-fD6hdWeYz_I7C9jrolBCQjvwaS0Gkj-v8TrOCKmnrLyeQPDy";
    
    const map = new Map({
    basemap: "satellite"//Elevation service
  });
    
    const view = new SceneView({
        map: map,
        container: "viewDiv",
        environment: {
            atmosphereEnabled: false,
            background: {
                type: "color",
                color: [0, 10, 16]
            },
        },
        popup: {
            dockEnabled: true,
            dockOptions: {
              position: "top-right",
              breakpoint: false,
              buttonEnabled: true
            },
            collapseEnabled: false
          },
          constraints: {
            // altitude: {
            //     min: 1000000,
            //     max: 25000000
            // }
          }
    });
    view.ui.remove("navigation-toggle");

    function callAjax(callback) {
      $.ajax({
        type: "GET",
        url: 'https://ssd-api.jpl.nasa.gov/fireball.api',
        dataType: "json",
        async: false,
        complete: function(result, status) {
          var data = JSON.parse(result.responseText);
          const header = Object.values(data.fields);
          const values = Object.values(data.data);
          const headerString = header.join(",");
          const rowItems = values.map(row => {
            if(row[4] == "S"){
              row[3] = -row[3];
            }
            if(row[6] == "W"){
              row[5] = -row[5];
            }
            return Object.values(row).join(",");
          });
          let x = [headerString, ...rowItems].join("\r\n");
           callback(x);
        }
      });
    };
    callAjax(x => {
      csv = x;
    })
    
    const blob = new Blob([csv], {
        type: 'text/plain'
    })

    const url = URL.createObjectURL(blob);
    const labelClass = new LabelClass({
      symbol: {
        type: "text",  // autocasts as new TextSymbol()
        color: "white",
        haloColor: "blue",
        haloSize: 1,
        font: {  // autocast as new Font()
           family: "Ubuntu Mono",
           size: 14,
           weight: "bold"
         }
      },
      labelPlacement: "above-right",
      maxScale: 0,
      minScale: 25000000,
    })

    const csvLayer = new CSVLayer({
        url: url,
        labelingInfo: [labelClass],
        labelsVisible: true,
        longitudeField: 'lon',
        latitudeField: 'lat',
        pupupEnabled: true,
        popupTemplate: {
            title: "Fireball at {date}",
            content: "<ul><li>This is a {lat} and {lon} fireball.</li></ul>",
        },
    });

    map.add(csvLayer);

  });

  