require('../assets/style.scss');
require('../node_modules/bootstrap-table/dist/bootstrap-table.min.css');
require('bootstrap-table');
require('jquery-form');

// TODO: display more info about the election.
// Currently it only shows who retrieved a voting card.

$(document).on('ready', () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let id = urlParams.get('id');
    if (!id) throw new Error('no id');

    var table = $('#votingcards-table');
    table.attr('data-url', `/api/v1/admin/${id}/votingcards`);
    table.bootstrapTable({
        columns: [
            // TODO: Make this generic for all irma identities!
            // TODO: Include a count?
            { field: 'irma-demo.gemeente.personalData.initials', title: 'Initialen' },
            {
                field: 'irma-demo.gemeente.personalData.familyname',
                title: 'Achternaam'
            },
            {
                field: 'irma-demo.gemeente.personalData.dateofbirth',
                title: 'Geboorte datum'
            }
        ],
        onLoadSuccess: data => console.log('table succesfully loaded, data: ', data),
        onLoadError: err => console.log('failed to load table: ', err)
    });
});
