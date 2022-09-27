// const windowWidth = document.getElementById("globe-container").clientWidth;
// const windowHeight = document.getElementById("globe-container").clientHeight;
const windowWidth = $("#globeViz").width();
const windowHeight = $("#globeViz").height();

let dateText = document.getElementById("date");
let energyText = document.getElementById("energy");

$(document).ready(function(){
    console.log({windowWidth, windowHeight});
    $.ajax({
        url: 'https://ssd-api.jpl.nasa.gov/fireball.api',
        complete: function() {
            console.log('COMPLETE');
        },
        success: function(data) {
            let requestedData = data.data;
            let impactData = [];
            for (let n = 0; n < requestedData.length; n++) {
                //Get Date & Time
                let date = requestedData[n][0].split(" ")[0];
                let time = requestedData[n][0].split(" ")[1];
                //Get Energy
                let energy = requestedData[n][1];

                let impact_energy = requestedData[n][2];
                //Get Latitude
                let lat = requestedData[n][3];
                let latdir = requestedData[n][4];
                if (latdir == 'S') lat *= -1;

                //Get Longitude
                let lng = requestedData[n][5];
                let lngdir = requestedData[n][6];
                if (lngdir == 'W') lng *= -1;


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
                    color: color
                };

                //Push entry
                impactData.push(entry);
            }

            //Create globe
            const globe = Globe()
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
            .backgroundImageUrl('https://staticdelivery.nexusmods.com/mods/448/images/63-0-1456805047.png')
            // .width(windowWidth/2)
            // .height(windowHeight - 50)
            .pointsData(impactData)
            .pointAltitude('size')
            .onPointClick((point) => {
                console.log(point);
                geocodeLatLng(point);
            })
            .pointColor('color')
            .enablePointerInteraction(true)
            (document.getElementById('globeViz'));
            
            globe.controls().autoRotate = true;
            globe.controls().autoRotateSpeed = 0.1;
        }
    });     
    
    $("#fireball-params").submit(function (e) {
        e.preventDefault();

        fire_ajax_submit();
    });
});


function geocodeLatLng(point){
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://geocodeapi.p.rapidapi.com/GetNearestCities?latitude="+point.lat+"&longitude="+point.lng+"8&range=0",
        "method": "GET",
        "headers": {
            "X-RapidAPI-Key": "6248a4fe70msh57539f13a4b0882p16a6afjsna26e1ac78437",
            "X-RapidAPI-Host": "geocodeapi.p.rapidapi.com"
        }
    };
    
    $.ajax(settings).done(function (response) {
        alert("The nearest city is " + response[0].City + ", " + response[0].Country + "\nThis impact happened on " + point.date + " at " + point.time
        + "\nIt had an energy of " + point.energy + " kilotons of TNT and an impact energy of " + point.impact_energy + " kilotons of TNT");
        console.log(response);
    });
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

function format_params(){

}