var data_table;
var maxCount;

//on page load, initialize the table
$(document).ready((d) => {
  inittable();
});


//initialize the table
function inittable() {

  //if the table already exists, destroy it
  if (data_table) {
    data_table.destroy();
  }

  //create the table with an ajax call to the server
  data_table = $("#fireball_data").DataTable({
    ajax: {
      url: "/graphs/inittable",
      dataSrc: (data) => {
        maxCount = data.count;
        $("#limit").attr("max", maxCount);
        $("#limit").attr("min", 1);
        $("#limit-label").val(parseInt($("#limit").val()));
        return data.data;
      },
    },
  });
}

//set the limit to half the max count returned from the server
$("#limit").val(maxCount/2);

//update the limit label when the limit slider is changed
$("#limit").on("input", (e) => {
  $("#limit-label").val(e.target.value);
});

//listens for changes to the form input fields
$("#dataTable_form").on("change", (e) => {
  var upperLimit = maxCount;
  var lowerLimit = 1;

  //if the limit field is changed, check that the value is within the range
  if (e.target.id == "limit") {
    if (e.target.value > upperLimit || e.target.value < lowerLimit) {

      //if the value is not within the range, display an error message
      $("#limit-help").attr("class", "text-danger");
      $("#limit-help").text(
        "Please enter a value between " + lowerLimit + " and " + upperLimit
      );
      return removeAlert();
    }

    //if the current element is the impact energy min or max field, check that the min is less than the max
  } else if (e.target.id == "impact-e-min" || e.target.id == "impact-e-max") {
    let min = parseInt($("#impact-e-min").val());
    let max = parseInt($("#impact-e-max").val());
    if (min > max) {

      //if the min is greater than the max, display an error message
      $("#impact-e-help").attr("class", "text-danger");
      $("#impact-e-help").text("Min must be less than Max");
      return removeAlert();
    }

    //if the current element is the energy min or max field, check that the min is less than the max
  } else if (e.target.id == "energy-min" || e.target.id == "energy-max") {
    let min = parseInt($("#energy-min").val());
    let max = parseInt($("#energy-max").val());
    if (min > max) {

      //if the min is greater than the max, display an error message
      $("#e-help").attr("class", "text-danger");
      $("#e-help").text("Min must be less than Max");
      return removeAlert();
    }

    //if the current element is the date min or max field, check that the min is less than the max
  } else if (e.target.id == "date-min" || e.target.id == "date-max") {
    let min = new Date($("#date-min").val());
    let max = new Date($("#date-max").val());
    if (min > max) {

      //if the min is greater than the max, display an error message
      $("#date-help").attr("class", "text-danger");
      $("#date-help").text("Start date must be before End date");
      return removeAlert();
    }

    //if the current element is the limit label field, check that the value is within the range
  } else if (e.target.id == "limit-label") {
    if (e.target.value > upperLimit || e.target.value < lowerLimit) {

      //if the value is not within the range, display an error message
      $("#limit-help").attr("class", "text-danger");
      $("#limit-help").text(
        "Please enter a value between " + lowerLimit + " and " + upperLimit
      );
      return removeAlert();

      //if the input field is empty, set it equal to the current value of the limit slider.
    } else if (e.target.value == "" || e.target.value == null) {
      return $("#limit-label").val($("#limit").val());
    } else {
      //if the value is within the range, update the limit field
      $("#limit").val(e.target.value);
    }
  }

  //set all the error messages to empty if the if statements are not triggered
  $("#impact-e-help").text("");
  $("#limit-help").text("");
  $("#e-help").text("");
  $("#date-help").text("");

  //update the table with the new search parameters
  updateTable(e);
});


//reset the form for the table, reset the table, and reinitialize the table
$("#reset").on("click", (e) => {
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
  return inittable();
});

//update the table with the new search parameters provided by the onchange event
var updateTable = (e) => {
  var search = {};
  search["date-min"] = e.delegateTarget[0].value;
  search["date-max"] = e.delegateTarget[1].value;
  search["energy-min"] = e.delegateTarget[2].value;
  search["energy-max"] = e.delegateTarget[3].value;
  search["impact-e-min"] = e.delegateTarget[4].value;
  search["impact-e-max"] = e.delegateTarget[5].value;
  search["limit"] = e.delegateTarget[7].value;

  //if the checkbox is checked, add the value to the search object, if not, do nothing
  if (e.delegateTarget[8].checked) {
    search["req-alt"] = true;
  }
  if (e.delegateTarget[9].checked) {
    search["req-vel"] = true;
  }
  if (e.delegateTarget[10].checked) {
    search["req-loc"] = true;
  }
  if (e.delegateTarget[11].checked) {
    search["req-vel-comp"] = true;
  }

  //create a new URLSearchParams object and append the search parameters to it
  var params = new URLSearchParams();
  for (var key in search) {
    if (typeof search[key] !== "undefined" && search[key] !== "") {
      params.append(key, search[key]);
    }
  }

  //update the table with the new search parameters
  try {
    $("#fireball_data")
      .DataTable()
      .ajax.url("/graphs/filltable?" + params.toString())
      .load();
  } catch (error) {
    console.log(error);
  }
};

//shows the form specific to each graph type depending on which tab is currently active
$("#pills-tab").on("click", "button", (e) => {
  if (e.target.id == "dataTable-tab") {
    $("#paramForm").hide();
    $("#dataTable_form").show();
  } else if(e.target.id == "boxPlot-tab"){
    $("#dataTable_form").hide();
    $("#linegraph-menu").hide();
    $("#boxplot-menu").show();
    $("#paramForm").show();
  } else if(e.target.id == "lineGraph-tab" || e.target.id == "scatterPlot-tab"){
    $("#dataTable_form").hide();
    $("#boxplot-menu").hide();
    $("#linegraph-menu").show();
    $("#paramForm").show();
  } 
});
