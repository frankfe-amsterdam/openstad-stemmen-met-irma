require('bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css');
require('bootstrap-table/dist/bootstrap-table.min.css');
require('../assets/style.scss');
require('bootstrap-datepicker');
require('bootstrap-table');
require('jquery-form');

function deleteElection(id) {
    fetch(`/api/v1/admin/${id}/delete`, { method: 'DELETE' }).then(res => {
        if (res.status === 204) $('#overview').bootstrapTable('refresh');
    });
}

$(document).on('ready', function () {
    $('#election-start')
        .datepicker({
            format: 'dd-mm-yyyy',
            autoclose: true
        })
        .on('changeDate', function (selected) {
            var minDate = new Date(selected.date.valueOf());
            $('#election-start').datepicker('setStartDate', minDate);
        });

    $('#election-end')
        .datepicker({
            format: 'dd-mm-yyyy',
            autoclose: true
        })
        .on('changeDate', function (selected) {
            var minDate = new Date(selected.date.valueOf());
            $('#election-end').datepicker('setEndDate', minDate);
        });

    $('#new').ajaxForm({
        url: '/api/v1/admin/new',
        dataType: 'json',
        type: 'POST',
        success: () => {
            $('#alert_placeholder').html(
                `<div class="alert alert-success" role="alert">Nieuwe verkiezing aangemaakt</div>`
            );
            $('#overview').bootstrapTable('refresh');
        },
        error: res => {
            $('#alert_placeholder').html(
                `<div class="alert alert-warning" role="alert">Verkiezing aanmaken mislukt: ${res.responseJSON.err}</div>`
            );
        }
    });

    $('#overview').bootstrapTable({
        showRefresh: true,
        columns: [
            { field: 'id', title: 'Election ID' },
            { field: 'name', title: 'Election Name' },
            { field: 'start', title: 'Start' },
            { field: 'end', title: 'End' },
            { field: 'creation', title: 'Creation date' },
            { field: 'participants', title: 'Participants' },
            {
                field: 'actions',
                title: 'Actions',
                formatter: () => {
                    return `
          <button type='button' style='font-size:17px' class='list btn btn-outline-primary border-0' ><i class="far fa-list-alt"></i></button>
          <button type='button' style='font-size:17px' class='remove btn btn-outline-danger border-0' ><i class='far fa-trash-alt'></i></button>
          <button type='button' style='font-size:17px' class='vote btn btn-outline-success border-0' ><i class="fas fa-vote-yea"></i></button>
          `;
                },
                events: {
                    'click .list': (e, value, row, index) => {
                        console.log('you clicked list');
                        window.location.href = `/admin/election?id=${row.id}`;
                    },
                    'click .remove': (e, value, row, index) => deleteElection(row.id),
                    'click .vote': (e, value, row, index) => {
                        window.location.href = `/user/?name=${row.name}`;
                    }
                }
            }
        ],
        onLoadSuccess: () => {
            console.log('table loaded');
        },
        onLoadError: () => {
            console.log('failed to load table');
            $('#alert_placeholder').html(
                `<div class="alert alert-warning" role="alert">U bent niet ingelogd. Log <a href="/admin/login">hier</a> in.</div>`
            );
        }
    });
});
