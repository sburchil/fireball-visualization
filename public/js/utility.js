function setRequestedData(jsonData) {
    let impactData = [];
    let requestedData = jsonData.data;
    for (let n = 0; n < requestedData.length; n++) {
        //Get Date & Time
        let date = requestedData[n][0].split(" ")[0];
        let time = requestedData[n][0].split(" ")[1];

        //Get Energy
        let energy = requestedData[n][1];

        //Get Impact Energy
        let impact_energy = requestedData[n][2];

        //Get Latitude
        let lat = requestedData[n][3];
        let latdir = requestedData[n][4];
        if (latdir == "S") lat *= -1;

        //Get Longitude
        let lng = requestedData[n][5];
        let lngdir = requestedData[n][6];
        if (lngdir == "W") lng *= -1;

        //Get Altitude
        let alt = requestedData[n][7];

        //Get velocity
        let vel = requestedData[n][8];
        let vel_cmp = {
            x: parseFloat(requestedData[n][9]),
            y: parseFloat(requestedData[n][10]),
            z: parseFloat(requestedData[n][11]),
        }
        //Set color and size
        let color = "";
        let size = Math.log(1.05 + energy / 200);
        if (energy > 300) {
            color = "#ff0000";
        } else if (energy > 150) {
            color = "#ff751a";
        } else if (energy > 75) {
            color = "#ffd11a";
        } else if (energy > 37.5) {
            color = "#ffff4d";
        } else if (energy > 18.25) {
            color = "#ffffb3";
        } else if (energy > 9.125) {
            color = "#ffffff";
        } else if (energy > 4.5625) {
            color = "#b3e6ff";
        } else if (energy > 2.28125) {
            color = "#3399ff";
        } else {
            color = "#1111ff";
        }

        //Create entry
        let entry = {
            date: date,
            time: time,
            impact_energy: parseFloat(impact_energy),
            energy: parseFloat(energy),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            size: parseFloat(size),
            color: color,
            alt: parseFloat(alt),
            vel: parseFloat(vel),
            vel_cmp: vel_cmp,
        };

        //Push entry
        impactData.push(entry);
    }
    return impactData;
}
function showAlert(obj, parent) {
    var script = `
    <script>
    sleep(3000).then(() => {
        removeAlert();
    })
    </script>`
    var html;
    if (obj.class == "success") {
        html =
            '<div class="alert alert-success alert-dismissible fade in show" role="alert">' +
            '   <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img"><use xlink:href="#check-circle-fill"/></svg>' +
            "   <label>" +
            obj.message +
            "</label>" +
            '       <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="Close">' +
            "       </button>";
        ("   </div>");
    } else if (obj.class == "danger") {
        html =
            '<div class="alert alert-danger alert-dismissible fade in show" role="alert">' +
            '   <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img"><use xlink:href="#exclamation-triangle-fill"/></svg>' +
            "   <label>" +
            obj.message +
            "</label>" +
            '       <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="Close">' +
            "       </button>";
        ("   </div>");
    }

    parent.append(html + script);
}
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const removeAlert = () => {
    var alertNode = document.querySelectorAll(".alert");
    if (alertNode.length > 0) {
        alertNode.forEach(node => {
            try {
                var alert = bootstrap.Alert.getOrCreateInstance(node);
                alert.close();
            } catch (error) {
                console.log(error);
            }

        })
    }
};

function goToPoint(lat, lng) {
    globe.pointOfView({ lat: lat, lng: lng, altitude: 1 }, 2000);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;

}
// clearing globe layers
function clearArcs() {
    globe.arcsData([]);
}
function clearPoints() {
    globe.pointsData([]);
}
function clearCustomLayer() {
    globe.customLayerData([]);
}
function clearLabelData() {
    globe.labelsData([]);
}
function clearRingData() {
    globe.ringsData([]);
}
function clearHtmlLayer() {
    globe.htmlElementsData([]);
}

// reverting point data
function revertPoints(impactData) {
    globe.pointsData(impactData);
}

const colorInterpolator = (t) => {
    return `rgba(${color.r},${color.g},${color.b},${Math.sqrt(1 - t)})`
};
