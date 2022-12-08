var data_table;
var maxCount;

$(document).ready((d) => {
  inittable();
});

function inittable() {
  if (data_table) {
    data_table.destroy();
  }

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
$("#limit").val(maxCount/2);

$("#limit").on("input", (e) => {
  $("#limit-label").val(e.target.value);
});

$("#dataTable_form").on("change", (e) => {
  var upperLimit = maxCount;
  var lowerLimit = 1;
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

  updateTable(e);
});

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

var updateTable = (e) => {
  var search = {};
  search["date-min"] = e.delegateTarget[0].value;
  search["date-max"] = e.delegateTarget[1].value;
  search["energy-min"] = e.delegateTarget[2].value;
  search["energy-max"] = e.delegateTarget[3].value;
  search["impact-e-min"] = e.delegateTarget[4].value;
  search["impact-e-max"] = e.delegateTarget[5].value;
  search["limit"] = e.delegateTarget[7].value;

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

  var params = new URLSearchParams();
  for (var key in search) {
    if (typeof search[key] !== "undefined" && search[key] !== "") {
      params.append(key, search[key]);
    }
  }
  // console.log(params.toString());
  try {
    $("#fireball_data")
      .DataTable()
      .ajax.url("/graphs/filltable?" + params.toString())
      .load();
  } catch (error) {
    console.log(error);
  }
};

$("#pills-tab").on("click", "button", (e) => {
  if (e.target.id == "dataTable-tab") {
    $("#paramForm").hide();
    $("#dataTable_form").show();
  } else {
    $("#paramForm").show();
    $("#dataTable_form").hide();
  }
});
