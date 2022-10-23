let dateText = document.getElementById("date");
let energyText = document.getElementById("energy");
let alerts = $("#alerts");
let impactData;
let globe = Globe({ animateln: true, waitForGlobeReady: true });
let maxCount;

$(document).ready((d) => {
    $.ajax({
        url: "/globe/init",
        type: "GET",
        dataType: "json",
        success: function (response) {
            var jsonData = JSON.parse(response);
            maxCount = parseInt(jsonData.count);
            $("#limit").attr("max", maxCount);
            $("#limit").val(Math.round(maxCount / 2)+1);
            $("#limit").attr("min", 1);
            $("#limit-label").val(parseInt($("#limit").val()));
            impactData = setRequestedData(jsonData);
            initGlobe(impactData);
        },
        error: function (error) {
            console.log(error);
        },
    });

    $('#offcanvasMenu').offcanvas({
      scroll: true,
      backdrop: false
    });
    $('#menu-toggle').click(function () {
        $('#offcanvasMenu').offcanvas('toggle');
         document.getElementById("toggle-icon").classList.toggle("rotate-icon");
    });
    $('#offcanvasMenu').on('hide.bs.offcanvas', function () {
        $('#menu-text').animate({
           left: "-=10px"
        }, 200)
    });
    $('#offcanvasMenu').on('show.bs.offcanvas', function () {
        $('#menu-text').animate({
            left: "+=10px"
        }, 200)
    });

    $("#dataModal").modal({
      backdrop: false,
      keyboard: false,
      focus: false,
    });

    $('#dataClose').on('click', function () {
      $('#dataModal').modal('hide');
    });
});

$("#reset").on("click", function () {
    destroyGlobe("labels");
    destroyGlobe("custom");
    pointGlobe(impactData);
    $("#alerts").html("");
});
$("#clear").on("click", () => {
    document.querySelectorAll("input").forEach((el) => (el.value = ""));
    $("#limit-label").val(parseInt($("#limit").val()));
});

globe.onPointClick((point) => {
    destroyGlobe("points");
    labelGlobe([point]);
    globe.controls().autoRotate = false;
    globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1 }, 2000);
});

$(window).resize(() => {
    globe.width(window.innerWidth).height(window.innerHeight);
});

function labelGlobe(requestedData) {
    globe
        .labelsData(requestedData)
        .labelLabel((el) => {
            return (
                "<strong> Click for Data on specific point </strong>"
            );
        })
        .labelText("date")
        .labelSize("size")
        .labelColor("color")
        .labelDotRadius("size")
        .labelResolution(2);
    globe.onLabelClick((label) => {
        $('#dataModal').modal('show');

        var date = label.date;
        var time = label.time;
        var impact_energy = label.impact_energy;
        var energy = label.energy;
        var lat = label.lat;
        var lng = label.lng;
        var alt = label.alt;
        var vel = label.vel;

        var dateText = "<ul style='list-style: none;'><li>Date: " + date + "</li>";
        var timeText = "<li>Time at peak brightness: " + time + "</li>";
        var impact_energyText = "<li>Estimated Impact Energy: " + impact_energy + " (kt)</li>";
        var energyText = "<li>Energy: " + energy + " x 10<sup>10</sup joules></li>";
        var latText = "<li>Latitude: " + lat + "</li>";
        var lngText = "<li>Longitude: " + lng + "</li>";
        var altText = "<li>Altitude: " + alt + "</li>";
        var velText = "<li>Velocity: " + vel + "</li></ul>";

        html = dateText + timeText + impact_energyText + energyText + latText + lngText + altText + velText;
        $('#dataModal').find('.modal-body').html(html);
    })
}

function pointGlobe(requestedData) {
    globe.pointsData(requestedData);
    globe
        .width(window.innerWidth)
        .height(window.innerHeight)
        .pointsData(requestedData)
        .pointAltitude("size")
        .pointColor("color");
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.1;
}

function initGlobe(impactData) {
    //Create globe
    globe
        (document.getElementById("globeViz"))
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
        .backgroundImageUrl(
            "//unpkg.com/three-globe/example/img/night-sky.png"
        )
        .showAtmosphere(true)
        .atmosphereColor("lightskyblue");
    globe
        .width(window.innerWidth)
        .height(window.innerHeight)
        .pointsData(impactData)
        .pointAltitude("size")
        .pointColor("color")
        .enablePointerInteraction(true);

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.2;
    globe.pointOfView({ alt: 10.0 }, 1000);


}

function destroyGlobe(choice) {
    if (choice == "points") {
        globe.pointsData(null).pointAltitude(null).pointColor(null);
    } else if (choice == "labels") {
        globe
            .labelsData(null)
            .labelText(null)
            .labelSize(null)
            .labelColor(null)
            .labelDotRadius(null)
            .labelResolution(null);
    } else if (choice == "custom") {
        globe.customLayerData(null);
    }
}

function search() {
    var search = {};
    search["date-min"] = $("#date-min").val();
    search["date-max"] = $("#date-max").val();
    search["energy-min"] = $("#energy-min").val();
    search["energy-max"] = $("#energy-max").val();
    search["impact-e-min"] = $("#impact-e-min").val();
    search["impact-e-max"] = $("#impact-e-max").val();
    search["limit"] = $("#limit").val();

    var searchParams = new URLSearchParams();

    for (var key in search) {
        if (typeof search[key] !== "undefined" && search[key] !== "") {
            searchParams.append(key, search[key]);
        }
    }

    $.ajax({
        type: "GET",
        url: "/globe/request",
        data: searchParams.toString(),
        success: function (data) {
            const jsonData = JSON.parse(data);
            if (jsonData.count > 0) {
                destroyGlobe("labels");
                const requestedData = setRequestedData(jsonData);
                pointGlobe(requestedData);
                    showAlert({
                        class: "success",
                        message: jsonData.count + " results returned.",
                    }, alerts);
            } else {
                showAlert({
                    class: "danger",
                    message: "No results returned. Try different search parameters.",
                }, alerts);
            }
        },
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log("fail");
    });
}