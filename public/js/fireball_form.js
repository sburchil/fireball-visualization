$('#paramForm').on('change', (e) => {
    let upperLimit = maxCount;
    let lowerLimit = 1;
    if (e.target.id == "limit") {
        if (e.target.value > upperLimit || e.target.value < lowerLimit) {
            $("#limit-help").attr("class", "text-danger");
            $("#limit-help").text(
                "Please enter a value between " + lowerLimit + " and " + upperLimit
            );
            return removeAlert();
        }
    } else if (e.target.id == "impact-e-min" || e.target.id == "impact-e-max") {
        let min = parseInt($("#impact-e-min").val());
        let max = parseInt($("#impact-e-max").val());
        if (min > max) {
            $("#impact-e-help").attr("class", "text-danger");
            $("#impact-e-help").text("Min must be less than Max");
            return removeAlert();
        }
    } else if (e.target.id == "energy-min" || e.target.id == "energy-max") {
        let min = parseInt($("#energy-min").val());
        let max = parseInt($("#energy-max").val());
        if (min > max) {
            $("#e-help").attr("class", "text-danger");
            $("#e-help").text("Min must be less than Max");
            return removeAlert();
        }
    } else if (e.target.id == "date-min" || e.target.id == "date-max") {
        let min = new Date($("#date-min").val());
        let max = new Date($("#date-max").val());
        if (min > max) {
            $("#date-help").attr("class", "text-danger");
            $("#date-help").text("Start date must be before End date");
            return removeAlert();
        }
    } else if (e.target.id == "limit-label") {
        if (e.target.value > upperLimit || e.target.value < lowerLimit) {
            $("#limit-help").attr("class", "text-danger");
            $("#limit-help").text(
                "Please enter a value between " + lowerLimit + " and " + upperLimit
            );
            return removeAlert();
        } else if (e.target.value == "" || e.target.value == null) {
            return $("#limit-label").val($("#limit").val());
        } else {
            $("#limit").val(e.target.value);
        }
    }
    $("#impact-e-help").text("");
    $("#limit-help").text("");
    $("#e-help").text("");
    $("#date-help").text("");

    search();
    var id = "#" + e.target.id;
    removeAlert();
    // $(id).prop('disabled', true);
    // sleep(200).then(() => {
    //     $(id).prop('disabled', false);
    // });
});


//everything below is setting up the hemisphere split function
document.getElementById('radioForm').addEventListener('change', (e) => {
    if (e.target.id == "radioYes") {
        $('#split-hemisphere').show();
    } else if (e.target.id == "radioNo") {
        $('#split-hemisphere').hide();
    }
});

//getting which quadrant the user wants to split the globe into
$('#splitForm').on('change', (e) => {
    if (globe.pointsData().length == 0) return;
    if ($('#radioYes').is(':checked')) {
        var form = document.getElementById('splitForm');
        var checkedData = [];
        for (el of form) {
            if (el.checked) {
                if (el.id == "checkNorth") {
                    $('#checkSouth').prop('disabled', true);
                } else if (el.id == "checkSouth") {
                    $('#checkNorth').prop('disabled', true);

                }
                checkedData.push(el.value);
            }
        }
        if (checkedData.length == 0) {
            $('#checkWest').prop('disabled', false);
            $('#checkEast').prop('disabled', false);
            $('#checkNorth').prop('disabled', false);
            $('#checkSouth').prop('disabled', false);
            return revertPoints(currentData);
        }
        splitData(checkedData, currentData);

    } else {
        return
    }
})

function splitData(checkedData, data) {
    var split_data = data;
    for (var i = 0; i < checkedData.length; i++) {
        if (checkedData[i] == 'north') {
            split_data = split_data.filter(function (d) {
                return d.lat >= 0;
            });
            continue;
        } else if (checkedData[i] == 'south') {
            split_data = split_data.filter(function (d) {
                return d.lat <= 0;
            });
            continue;
        } else if (checkedData[i] == 'west') {
            split_data = split_data.filter(function (d) {
                return d.lng <= 0;
            });
            continue;
        } else if (checkedData[i] == 'east') {
            split_data = split_data.filter(function (d) {
                return d.lng >= 0;
            });
            continue;
        } else {
        }
    }

    if(split_data.length == 0){
        revertPoints(currentData);
        sleep(100).then(() => {
            showAlert({
                class: "danger", 
                message: "No data found for selected hemisphere(s)."
            }, alerts);
        });
        return;
    }
    pointGlobe(split_data);
    sleep(100).then(() => {
        showAlert({
            class: "success",
            message: split_data.length + " results returned.",
        }, alerts);
    });
}

$("#limit").on("input", (e) => {
    $("#limit-label").val(e.target.value);
});