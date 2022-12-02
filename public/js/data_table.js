var data_table = $('#fireball_data').DataTable();

console.log(data_table);

data_table.ajax.url('/graphs/filltable').load();

$("#dataTable_form").on("submit", (e) => {
    e.preventDefault();

    $('#date-min').removeClass('is-invalid');
    $('#date-max').removeClass('is-invalid');
    $('#date-help').text('');

    var date_min = new Date(e.target[0].value);
    var date_max = new Date(e.target[1].value);
    if ((date_min > date_max)) {
        $('#date-min').addClass('is-invalid');
        $("#date-help").attr("class", "text-danger");
        $('#date-help').text("Start date must be before end date.");
        return removeAlert();
    } else if ((date_min.toString() === date_max.toString())) {
        $('#date-min').addClass('is-invalid');
        $('#date-max').addClass('is-invalid');
        $("#date-help").attr("class", "text-danger");
        $('#date-help').text("Dates cannot be the same.");
        return removeAlert();
    } else if ((date_min > new Date()) || (date_max > new Date())) {
        $("#date-help").attr("class", "text-success");
        $('#date-help').text("Dates are invalid. They cannot be in the future.");
        return removeAlert();
    }
    var date = {
        'date-min': date_min.toISOString().split('T')[0],
        'date-max': date_max.toISOString().split('T')[0]
    }

    var params = new URLSearchParams(date);
    data_table.ajax.url('/graphs/filltable?'+params.toString()).load();
});

$('#pills-tab').on('click', 'button', (e) => {
    if(e.target.id == "dataTable-tab"){
        $('#paramForm').hide();
        $('#dataTable_form').show();
    } else {
        $('#paramForm').show();
        $('#dataTable_form').hide();
    }
})
