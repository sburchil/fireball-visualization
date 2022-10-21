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
    } else if (e.target.id == "limit-label"){
        if(e.target.value > upperLimit || e.target.value < lowerLimit){
            $("#limit-help").attr("class", "text-danger");
            $("#limit-help").text(
                "Please enter a value between " + lowerLimit + " and " + upperLimit
            );
            return removeAlert();
        } else if(e.target.value == "" || e.target.value == null) {
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
})

$("#limit").on("input", (e) => {
    $("#limit-label").val(e.target.value);
});