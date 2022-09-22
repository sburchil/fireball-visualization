require([
    "esri/config",
    "esri/Map",
    "esri/views/SceneView",
    "esri/layers/CSVLayer",
], function(esriConfig,Map, SceneView, CSVLayer) {
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
              buttonEnabled: false
            },
            collapseEnabled: false
          },
          constraints: {
            altitude: {
                min: 1000000,
                max: 25000000
            }
          }
    });
    view.ui.remove("navigation-toggle");
    var csv = [];
    d3.csv('../data/fireballs.csv', (data) => {
      csv.push(data);
    })
  
    console.log(csv);
    const blob = new Blob([d3.csv('../data/fireballs.csv'), (data) => {return data}], {
        type: 'plain/text'
    })
    const url = URL.createObjectURL(blob);
    console.log(url);

    const csvLayer = new CSVLayer({
        url: url,
    });
    map.add(csvLayer);

  });