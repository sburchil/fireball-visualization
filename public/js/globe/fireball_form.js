
//jquery specific event listener that listens for a change in the input fields of the form
$('#paramForm').on('change', (e) => {
    let upperLimit = maxCount;
    let lowerLimit = 1;

    //if the input field is the limit field
    //check if the value is within the upper and lower limits
    if (e.target.id == "limit") {
        if (e.target.value > upperLimit || e.target.value < lowerLimit) {
            $("#limit-help").attr("class", "text-danger");
            $("#limit-help").text(
                "Please enter a value between " + lowerLimit + " and " + upperLimit
            );
            return removeAlert();
        }

        //if the input field is the impact energy min or max field
    } else if (e.target.id == "impact-e-min" || e.target.id == "impact-e-max") {
        let min = parseInt($("#impact-e-min").val());
        let max = parseInt($("#impact-e-max").val());

        //check if the min is greater than the max
        if (min > max) {
            //if so, change the text of the help text to red and display the error message
            $("#impact-e-help").attr("class", "text-danger");
            $("#impact-e-help").text("Min must be less than Max");
            return removeAlert();
        }

        //if the input field is the energy min or max field
    } else if (e.target.id == "energy-min" || e.target.id == "energy-max") {
        let min = parseInt($("#energy-min").val());
        let max = parseInt($("#energy-max").val());

        //check if the min is greater than the max
        if (min > max) {
            //if so, change the text of the help text to red and display the error message
            $("#e-help").attr("class", "text-danger");
            $("#e-help").text("Min must be less than Max");
            return removeAlert();
        }

        //if the input field is the date min or max field
    } else if (e.target.id == "date-min" || e.target.id == "date-max") {
        let min = new Date($("#date-min").val());
        let max = new Date($("#date-max").val());
        
        //check if the min is greater than the max
        if (min > max) {
            //if so, change the text of the help text to red and display the error message
            $("#date-help").attr("class", "text-danger");
            $("#date-help").text("Start date must be before End date");
            return removeAlert();
        } 

        //if the input field is the limit label field
    } else if (e.target.id == "limit-label") {
        //check if the value is greater than the upper limit or less than the lower limit
        if (e.target.value > upperLimit || e.target.value < lowerLimit) {
            //if so, change the text of the help text to red and display the error message
            $("#limit-help").attr("class", "text-danger");
            $("#limit-help").text(
                "Please enter a value between " + lowerLimit + " and " + upperLimit
            );
            return removeAlert();

            //if the value is empty, set the value of the limit field to the upper limit
        } else if (e.target.value == "" || e.target.value == null) {
            return $("#limit-label").val($("#limit").val());

            //if the value is within the upper and lower limits, set the value of the limit field to the value of the limit label field
        } else {
            $("#limit").val(e.target.value);
        }
    }
    $("#impact-e-help").text("");
    $("#limit-help").text("");
    $("#e-help").text("");
    $("#date-help").text("");

    //execute the search function
    search();

    //remove remaining alerts
    removeAlert();

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

//splitting the data into the quadrants
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

    //if no data is found, revert the points and display an alert
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

    //if data is found, display the points and display an alert with the amount of results returned
    pointGlobe(split_data);
    sleep(100).then(() => {
        showAlert({
            class: "success",
            message: split_data.length + " results returned.",
        }, alerts);
    });
}

//listens for changes in the slider to updae the limit-label field
$("#limit").on("input", (e) => {
    $("#limit-label").val(e.target.value);
});