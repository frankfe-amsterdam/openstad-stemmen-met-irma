const irma = require('@privacybydesign/irma-frontend');
const style = require('../assets/style.scss');

let options = {
    debugging: true,
    element: '#irma-web-form',
    session: {
        url: '/api/v1/admin/login',
        start: {
            url: o => `${o.url}/start`,
            method: 'GET'
        },
        mapping: {
            sessionPtr: r => r
        },
        result: {
            url: o => `${o.url}/finish`,
            parseResponse: r => r.status
        }
    }
};

var irmaWeb = irma.newWeb(options);
irmaWeb.start().then(status => {
    if (status === 200) window.location.href = '/admin/';
});
