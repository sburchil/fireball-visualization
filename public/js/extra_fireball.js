// const windowWidth = document.getElementById("globe-container").clientWidth;
// const windowHeight = document.getElementById("globe-container").clientHeight;
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

let dateText = document.getElementById("date");
let energyText = document.getElementById("energy");
let impactData = [];

let globe = Globe({animateln: true});

$(document).ready(function(){
    
    const jsonData = JSON.parse(document.getElementById("responseJson").value);
    console.log(jsonData);

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
                if (latdir == 'S') lat *= -1;

                //Get Longitude
                let lng = requestedData[n][5];
                let lngdir = requestedData[n][6];
                if (lngdir == 'W') lng *= -1;

                //Get Altitude
                let alt = requestedData[n][7];

                //Get velocity
                let vel = requestedData[n][8];
                //Set color and size
                let color = '';
                let size = Math.log(1.05 + (energy / 500));
                if (energy > 300) {
                    color = '#ff0000';
                } else if (energy > 150) {
                    color = '#ff751a';
                } else if (energy > 75) {
                    color = '#ffd11a';
                } else if (energy > 37.5) {
                    color = '#ffff4d';
                } else if (energy > 18.25) {
                    color = '#ffffb3';
                } else if (energy > 9.125){
                    color = '#ffffff';
                } else if (energy > 4.5625){
                    color = '#b3e6ff';
                } else if (energy > 2.28125){
                    color = '#3399ff';
                } else {
                    color = '#1111ff';
                }

                //Create entry
                let entry = {
                    date: date,
                    time: time,
                    impact_energy: impact_energy,
                    energy: energy,
                    lat: lat,
                    lng: lng,
                    size: size,
                    color: color,
                    alt: alt,
                    vel: vel
                };

                //Push entry
                impactData.push(entry);
            }
            initGlobe();
            globe.onPointClick(point => {
                console.log(point);
                destroyGlobe("points");
                newGlobe();
            });
            globe.onLabelClick(label => {
                globe.controls().autoRotate = false;
                globe.pointOfView({lat: label.lat, lng: label.lng}, 3000);
            });
    });

    $("#fireball-params").submit(function (e) {
        e.preventDefault();

        fire_ajax_submit();
    });



$('#reset').on('click', function(){
    destroyGlobe("labels");
    globe
    .pointsData(impactData)
    .width(sizes.width)
    .height(sizes.height)
    .pointsData(impactData)
    .pointAltitude('size')
    .pointColor('color');
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.1;
})

window.addEventListener('resize', () =>
{
    globe.width(window.innerWidth).height(window.innerHeight);
});

function newGlobe(){
    globe
    .labelsData(impactData)
    .labelText('energy')
    .labelSize('size')
    .labelColor('color')
    .labelDotRadius('size')
    .labelResolution(2)
}

function initGlobe(){
    //Create globe
    globe.globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .backgroundImageUrl('https://staticdelivery.nexusmods.com/mods/448/images/63-0-1456805047.png')
    .width(sizes.width)
    .height(sizes.height)
    .pointsData(impactData)
    .pointAltitude('size')
    .pointColor('color')
    .enablePointerInteraction(true)
    .pointOfView({lat: 0, lng: 0, altitude: 3.5})
    (document.getElementById('globeViz'));
    
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.1;
}

function destroyGlobe(choice){

    if(choice == "points"){
        globe
        .pointsData(null)
        .pointAltitude(null)
        .pointColor(null);
    } else if (choice == "labels"){
        globe
        .labelsData(null)
        .labelText(null)
        .labelSize(null)
        .labelColor(null)
        .labelDotRadius(null)
        .labelResolution(null);
    }
}


function fire_ajax_submit() {
    var search = {}
    search["date"] = $("#date").val();
    search["energy"] = $("#energy").val();
    $("#submit").prop("disabled", true);

    $.ajax({
        url: "https://ssd-api.jpl.nasa.gov/fireball.api",
        success: function (data) {
            var json = "<h4>Ajax Response</h4><pre>"
                + JSON.stringify(data, null, 4) + "</pre>";
            $('#feedback').html(json);
            console.log("SUCCESS : ", data);
            $("#submit").prop("disabled", false);
        },
        error: function (e) {
            var json = "<h4>Ajax Response</h4><pre>"
                + e.responseText + "</pre>";
            $('#feedback').html(json);
            console.log("ERROR : ", e);
            $("#submit").prop("disabled", false);
        }
    });
}