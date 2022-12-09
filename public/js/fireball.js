let dateText = document.getElementById("date");
let energyText = document.getElementById("energy");
var choice = document.getElementById("showData").value;
let alerts = $("#alerts");
let impactData;
let currentData;
//initialize the globe
var globe = Globe({ animateln: true, waitForGlobeReady: true });

let maxCount;
let speed = 0;

// function to set the data for the globe
$(document).ready((d) => {
    $("#animationControls").hide();
    if (choice == "true") {
        $(".home-page").remove();
    } else if (choice == "false") {
        $(".wrapper").css("opacity", "0");
    }

    //populate the globe
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
            currentData = impactData.slice();
            initGlobe(impactData);
            if (choice == "true") {
                $(".home-page").html("");
                globe.pointOfView({ altitude: 5 }, 2000);
            } else {
                globe.pointOfView({ altitude: 100 });
            }
        },
        error: function (error) {
            console.log(error);
        },
    });

    //initialize the off canvas menu
    $("#offcanvasMenu").offcanvas({
        scroll: true,
        backdrop: false,
    });

    //animates the menu icon
    $("#menu-toggle").click(function () {
        $("#offcanvasMenu").offcanvas("toggle");
        document.getElementById("toggle-icon").classList.toggle("rotate-icon");
    });

    //animates the menu text
    $("#offcanvasMenu").on("hide.bs.offcanvas", function () {
        $("#menu-text").animate(
            {
                left: "-=10px",
            },
            200
        );
    });
    //animates the menu text
    $("#offcanvasMenu").on("show.bs.offcanvas", function () {
        $("#menu-text").animate(
            {
                left: "+=10px",
            },
            200
        );
    });

    //initialize the data modal
    $("#dataModal").modal({
        backdrop: false,
        keyboard: false,
        focus: false,
    });
    $("#dataClose").on("click", function () {
        $("#dataModal").modal("hide");
    });
    $("#split-hemisphere").hide();
});

//controls the globe
$("#controlForm").on("input", (e) => {
    if (e.target.id == "pauseRotation") {
        if (e.target.checked) return (globe.controls().autoRotate = false);
        return (globe.controls().autoRotate = true);
    }
    if (e.target.id == "reverseRotation") {
        return (globe.controls().autoRotateSpeed *= -1);
    }
    if (e.target.id == "rotationSpeed") {
        if ($("#reverseRotation").is(":checked"))
            return (globe.controls().autoRotateSpeed = -e.target.value);
        return (globe.controls().autoRotateSpeed = e.target.value);
    }
});

//resets the globe on click
$("#reset").on("click", function () {
    $("#pause-play").children().attr("class", "fa-solid fa-play");
    speed = 0;
    //reset all points
    if (globe.customLayerData() != []) {
        clearCustomLayer();
    }
    if (globe.ringsData() != []) {
        clearRingData();
    }
    if (globe.htmlElementsData() != []) {
        clearHtmlLayer();
    }
    if (globe.pointsData() != []) {
        clearPoints();
    }

    //repopulate the point layer
    revertPoints(impactData);
    currentData = impactData.slice();
    createMoon();
    globe.pointOfView({ lat: 0, lng: 0, altitude: 5 }, 2000);
    if ($("#pauseRotation")[0].checked) {
        globe.controls().autoRotate = false;
    } else {
        globe.controls().autoRotate = true;
    }
    showAlert(
        {
            class: "success",
            message: "Globe reset",
        },
        alerts
    );
});

//resets the menu inputs on click
$("#clear").on("click", () => {
    document.querySelectorAll("input").forEach((el) => {
        if (el.type == "checkbox") {
            el.checked = false;
            $("#checkWest").prop("disabled", false);
            $("#checkEast").prop("disabled", false);
            $("#checkNorth").prop("disabled", false);
            $("#checkSouth").prop("disabled", false);
        } else {
            el.value = "";
        }
    });
    $("#limit-label").val(parseInt($("#limit").val()));
});

//resizes the globe on window resize
$(window).resize((e) => {
    globe.width(window.innerWidth).height(window.innerHeight);
});

//function to initizalize the globe
function initGlobe(impactData) {
    //Create globe
    globe(document.getElementById("globeViz"))
        .globeImageUrl("/images/earth.jpg")
        .backgroundImageUrl("/images/night-sky.png")
        .showAtmosphere(true)
        .atmosphereColor("lightskyblue");
    globe
        .width(window.innerWidth)
        .height(window.innerHeight)
        .enablePointerInteraction(true);

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.2;
    pointGlobe(impactData);
    createMoon();
}

//function to create the html elments for the globe
function htmlGlobe(requestedData) {
    //create the html elements
    const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;
    globe
        .htmlElementsData(requestedData)
        .htmlLat((d) => d.lat + 0.5)
        .htmlElement((d) => {
            const el = document.createElement("div");
            el.innerHTML = markerSvg;
            el.style.color = d.color;
            el.style.width = `${d.size + 30}px`;

            el.style["pointer-events"] = "auto";
            el.style.cursor = "pointer";

            //creates onclick event for each marker
            el.onclick = () => {
                globe.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1 }, 2000);
                $("#dataModal").modal("show");

                var date = d.date;
                var time = d.time;
                var impact_energy = d.impact_energy;
                var energy = d.energy;
                var lat = d.lat;
                var lng = d.lng;
                var alt = d.alt;
                var vel = d.vel;

                var dateText =
                    "<ul style='list-style: none;'><li>Date: " + date + "</li>";
                var timeText = "<li>Time at peak brightness: " + time + "</li>";
                var impact_energyText =
                    "<li>Estimated Impact Energy: " + impact_energy + " (kt)</li>";
                var energyText =
                    "<li>Energy: " + energy + " x 10<sup>10</sup joules></li>";
                var latText = "<li>Latitude: " + lat + "</li>";
                var lngText = "<li>Longitude: " + lng + "</li>";
                var altText = "<li>Altitude: " + alt + "</li>";
                var velText = "<li>Velocity: " + vel + "</li></ul>";

                html =
                    dateText +
                    timeText +
                    impact_energyText +
                    energyText +
                    latText +
                    lngText +
                    altText +
                    velText;
                $("#dataModal").find(".modal-body").html(html);
            };
            return el;
        })
        .htmlTransitionDuration(1000);
}

//function to create the rings for the globe
function createImpactLayer(requestedData) {
    clearCustomLayer();
    var color = hexToRgb(requestedData[0].color);
    const colorInterpolator = (t) =>
        `rgba(${color.r},${color.g},${color.b},${Math.sqrt(1 - t)})`;

    globe
        .ringsData([requestedData[0]])
        .ringColor(() => colorInterpolator)
        .ringMaxRadius((d) => {
            return Math.sin(d.impact_energy) * Math.log(d.impact_energy) * Math.PI;
        })
        .ringPropagationSpeed(2.5)
        .ringRepeatPeriod(1000);
}

//function to create the points for the globe
function pointGlobe(requestedData) {
    globe.pointsData(requestedData).pointAltitude("size").pointColor("color");
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.1;

    globe.onPointClick((point) => {
        clearPoints();
        $("#animationControls").show();
        createFireball([point]);

        globe.controls().autoRotate = false;
        globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1 }, 2000);
    });
}

//function to create the moon for the globe
var createMoon = () => {
    var mData = [...Array(1).keys()].map(() => ({
        lat: 6.0,
        lng: 80.5,
        alt: 5,
        radius: 20.0,
        rotation: {
            x: 0,
            y: 0,
            z: 0,
        },
    }));

    //creates the moon through THREE.js
    globe
        .customLayerData(mData)
        .customThreeObject((d) => {
            var geometry = new THREE.DodecahedronGeometry(d.radius, 2);
            var material = new THREE.MeshBasicMaterial({ color: "darkgray" });
            material.map = new THREE.TextureLoader().load("/images/moon.jpg");
            material.bumpmap = new THREE.TextureLoader().load(
                "/images/asteroid_bumpmap.jpg"
            );
            material.bumpScale = 0.1;
            var mesh = new THREE.Mesh(geometry, material);
            return mesh;
        })
        .customThreeObjectUpdate((obj, d) => {
            Object.assign(obj.rotation, {
                x: d.rotation.x,
                y: d.rotation.y,
                z: d.rotation.z,
            });
            Object.assign(obj.position, globe.getCoords(d.lat, d.lng, d.alt));
        });

    var clicks = 0;

    //adds an easter egg :)))))))))
    globe.onCustomLayerClick((e) => {
        clicks++;
        if (clicks == 5) {
            e.__threeObj.material.color.setRGB(255, 0, 0);
            sleep(200).then(() => {
                e.__threeObj.material.color.setRGB(0, 255, 0);
            });
            sleep(400).then(() => {
                e.__threeObj.material.color.setRGB(0, 0, 255);
            });
            sleep(600).then(() => {
                e.__threeObj.material.color.setRGB(
                    0.6627450980392157,
                    0.6627450980392157,
                    0.6627450980392157
                );
            });
            clicks = 0;
            window.open("https://youtu.be/dQw4w9WgXcQ");
        }
    });

    var reverse = false;

    //callback function to create the moon's orbit
    (function moveSpheres() {
        if (Math.floor(mData[0].lat) >= 10 && Math.floor(mData[0].lng % 90) == 0)
            reverse = true;
        if (Math.floor(mData[0].lat) <= -10 && Math.floor(mData[0].lng % 90) == 0)
            reverse = false;
        mData[0].lng += 0.03;
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
};

//function to create the fireball for the globe
function createFireball(data) {
    var new_data = {
        date: data[0].date,
        time: data[0].time,
        lat: data[0].lat,
        lng: data[0].lng,
        // size: Math.sin(data[0].size) * Math.log(10 + data[0].size/1.05),
        size: data[0].size,
        energy: data[0].energy,
        impact_energy: data[0].impact_energy,
        alt: 0.5,
        vel: data[0].vel,
        vel_cmp: {
            x: data[0].vel_cmp.x,
            y: data[0].vel_cmp.y,
            z: data[0].vel_cmp.z,
        },
        color: data[0].color,
    };
    if (new_data.size < 0.3) new_data.size = 0.5;

    globe.customLayerData([new_data]);

    //creates the fireball through THREE.js
    globe.customThreeObject((d) => {
        var geometry = new THREE.DodecahedronGeometry(d.size, 2);
        var material = new THREE.MeshBasicMaterial({ color: "darkgray" });
        material.map = new THREE.TextureLoader().load("/images/asteroid.jpg");
        material.bumpmap = new THREE.TextureLoader().load(
            "/images/asteroid_bumpmap.jpg"
        );
        material.bumpScale = 0.1;
        var mesh = new THREE.Mesh(geometry, material);
        return mesh;
    });

    //updates the fireball's position
    globe.customThreeObjectUpdate((obj, d) => {
        Object.assign(obj.position, globe.getCoords(d.lat, d.lng, d.alt));
    });

    var stop = false;

    //callback function to create the fireball's movement, updating the fireball's position
    (function moveFireball() {
        if (new_data.alt <= 0.0) {
            stop = true;
            $("#animationControls").hide();
        } else if (new_data.alt > 0) {
            new_data.alt -= speed * 100;
        }
        globe.customLayerData(globe.customLayerData());
        if (!stop) {
            requestAnimationFrame(moveFireball);
        } else {
            htmlGlobe([data[0]]);
            createImpactLayer([new_data]);
        }
    })();
}

//function to create the ajax request to the server
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
                clearLabelData();
                const requestedData = setRequestedData(jsonData);
                currentData = requestedData.slice();
                pointGlobe(requestedData);
                sleep(100).then(() => {
                    showAlert(
                        {
                            class: "success",
                            message: jsonData.count + " results returned.",
                        },
                        alerts
                    );
                });
            } else {
                showAlert(
                    {
                        class: "danger",
                        message: "No results returned. Try different search parameters.",
                    },
                    alerts
                );
            }
        },
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log("fail");
    });
}
