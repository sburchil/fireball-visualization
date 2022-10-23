let dateText = document.getElementById("date");
let energyText = document.getElementById("energy");
let alerts = $("#alerts");
let impactData;
let globe = Globe({ animateln: true, waitForGlobeReady: true });
let maxCount;

window.onkeypress = (e) => {
    if (e.key == "s") {
        if (globe.controls().autoRotateSpeed == 0) {
            globe.controls().autoRotateSpeed = 0.2;
        } else {
            globe.controls().autoRotateSpeed = 0;

        }
    }
}


$(document).ready((d) => {
    $.ajax({
        url: "/globe/init",
        type: "GET",
        dataType: "json",
        success: function (response) {
            var jsonData = JSON.parse(response);
            maxCount = parseInt(jsonData.count);
            $("#limit").attr("max", maxCount);
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
    // globe.pointOfView({ lat: 0, lng: 0, altitude: 3 }, 2000);
    // pointGlobe(impactData);
    htmlGlobe(impactData);
    $("#alerts").html("");
});
$("#clear").on("click", () => {
    document.querySelectorAll("input").forEach((el) => (el.value = ""));
    $("#limit-label").val(parseInt($("#limit").val()));
});

globe.onPointClick((point) => {
    destroyGlobe("points");
    createFireball([point]);
    labelGlobe([point]);
    globe.controls().autoRotate = false;
    globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1 }, 2000);
});

$(window).resize((e) => {
    globe.width(window.innerWidth).height(window.innerHeight);
});

function htmlGlobe(requestedData) {
    const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;
    globe
        .htmlElementsData(requestedData)
        .htmlElement((d) => {
            const el = document.createElement('div');
            el.innerHTML = markerSvg;
            el.style.color = d.color;
            el.style.width = `${d.size + 10.2}px`;

            el.style['pointer-events'] = 'auto';
            el.style.cursor = 'pointer';
            el.onclick = () => goToPoint(d.lat, d.lng);
            return el;
        })
        .htmlTransitionDuration(1000);
    globe.pointOfView({ lat: 0, lng: 0, altitude: 5 }, 2000);
}

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

var createMoon = () => {
    var mData = [...Array(1).keys()].map(() => ({
        lat: 2.0,
        lng: 4.5,
        alt: 2.5,
        radius: 30.0,
        rotation: {
            x: 0,
            y: 0,
            z: 0,
        }
    }));

    globe.customLayerData(mData)
        .customThreeObject((d) => {
            var geometry = new THREE.DodecahedronGeometry(d.radius, 2);
            var material = new THREE.MeshBasicMaterial({ color: 'darkgray' });
            material.map = new THREE.TextureLoader().load('/images/moon.jpg');
            material.bumpmap = new THREE.TextureLoader().load('/images/asteroid_bumpmap.jpg');
            material.bumpScale = 0.1;
            var mesh = new THREE.Mesh(
                geometry,
                material
            )
            return mesh;
        })
        .customThreeObjectUpdate((obj, d) => {
            Object.assign(obj.rotation, { x: d.rotation.x, y: d.rotation.y, z: d.rotation.z });
            Object.assign(obj.position, globe.getCoords(d.lat, d.lng, 3));
        });


    var reverse = false;
    (function moveSpheres() {
        if (((Math.floor(mData[0].lat) >= 10) && (Math.floor(mData[0].lng % 90) == 0))) reverse = true;
        if (((Math.floor(mData[0].lat) <= -10) && (Math.floor(mData[0].lng % 90) == 0))) reverse = false;
        mData[0].lng += 0.03;
        // console.log(Math.floor(d.lng % 90));
        if (reverse) {
            mData[0].lat = mData[0].lat - 0.001;
            mData[0].lat -= 0.003;
        } else {
            mData[0].lat = mData[0].lat + 0.001;
            mData[0].lat += 0.003;
        }
        mData[0].rotation.y += 0.004;
        globe.customLayerData(globe.customLayerData());
        requestAnimationFrame(moveSpheres);
    })();

}

function createFireball(data) {
    var new_data = [...Array(1).keys()].map(() => ({
        lat: data[0].lat,
        lng: data[0].lng,
        size: data[0].size,
        alt: 0.5,
        vel: data[0].vel,
        vel_cmp: {
            x: data[0].vel_cmp.x,
            y: data[0].vel_cmp.y,
            z: data[0].vel_cmp.z
        },
        slope: (data[0].vel_cmp.y - data[0].lat) / (data[0].vel_cmp.x - data[0].lng)
    }));
    globe
        .customLayerData(new_data);

    if (new_data[0].vel === "" || new_data[0].vel === "undefined" || new_data[0].vel === null) {
        globe.customThreeObject((d) => {
            var geometry = new THREE.DodecahedronGeometry(d.size, 1);
            var material = new THREE.MeshBasicMaterial({ color: 'darkgray' });
            material.map = new THREE.TextureLoader().load('/images/asteroid.jpg');
            material.bumpmap = new THREE.TextureLoader().load('/images/asteroid_bumpmap.jpg');
            material.bumpScale = 0.1;
            var mesh = new THREE.Mesh(
                geometry,
                material
            )
            return mesh;
        }
        );
    } else {
        globe.customThreeObject((d) => {
            var geometry = new THREE.DodecahedronGeometry(d.size, 1);
            var material = new THREE.MeshBasicMaterial({ color: 'darkgray' });
            material.map = new THREE.TextureLoader().load('/images/asteroid.jpg');
            material.bumpmap = new THREE.TextureLoader().load('/images/asteroid_bumpmap.jpg');
            material.bumpScale = 0.1;
            var mesh = new THREE.Mesh(
                geometry,
                material
            )
            return mesh;
        });
    }

    globe.customThreeObjectUpdate((obj, d) => {
        Object.assign(obj.position, globe.getCoords(d.lat, d.lng, d.alt));
    });

    var speed = 0;
    window.onkeydown = (e) => {
        if (e.keyCode === 32) {
            speed = 0
        } else if (e.keyCode === 39) {
            speed += 0.00001;
        } else if (e.keyCode === 37) {
            speed -= 0.00001;
        }
    }
    // removeAlert();

    (function moveFireball() {
        new_data.forEach(d => {
            if (d.alt < 0) {
                d.alt = 0;
            } else {
                d.alt -= speed * d.vel;
            }
        });
        globe.customLayerData(globe.customLayerData());
        requestAnimationFrame(moveFireball);
    })();


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

    // globe.controls().autoRotate = true;
    // globe.controls().autoRotateSpeed = 0.2;
    globe.pointOfView({ alt: 10.0 }, 1000);
    sleep(1000).then(() => {
        createMoon();
    });



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
                sleep(100).then(() => {
                    showAlert({
                        class: "success",
                        message: jsonData.count + " results returned.",
                    }, alerts);
                });
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