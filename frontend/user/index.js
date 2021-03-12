const irma = require('@privacybydesign/irma-frontend');
const style = require('../assets/style.scss');

// If this gets any more complicated whe should use a state machine

const step1 = `Om te kunnen stemmen wordt eerst met IRMA uw identiteit vastgesteld. Dit voorkomt dubbel stemmen. U kunt daarna een anonieme niet-traceerbare stemkaart in uw IRMA app laden. Daarna kunt u op een andere website deze stemkaart inzetten om te stemmen. Doordat het stemmen op een andere website gebeurt, kunt u niet getraceerd worden en weet niemand wie de stem uitbrengt. Houd daarvoor wel uw stemkaart prive.`;
const step2 = `Uw identiteit is vastgesteld. U mag stemmen. Um te kunnen stemmen kunt u nu een anonieme niet-traceerbare stemkaart in uw IRMA app laden. Daarna kunt u op een andere website deze stemkaart inzetten om te stemmen. Doordat het stemmen op een andere website gebeurt, kunt u niet getraceerd worden en weet niemand wie de stem uitbrengt. Houd daarvoor wel uw stemkaart prive.`;

let options = {
    debugging: true,
    element: '#irma-web-form',
    session: {
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

function onElectionData(electionData) {
    var irmaWeb = irma.newWeb(options);
    irmaWeb
        .start()
        .then(result => {
            // wait two seconds to display check mark
            return new Promise(resolve => setTimeout(() => resolve(result), 2000));
        })
        .then(result => {
            if (result !== 200) throw new Error('disclosure failed');
            console.log('disclosure completed');
            document.querySelector('#election-step').innerText = step2;
            document.querySelector('#irma-help-text').innerText = 'Scan dan de QR code rechts om verder te gaan.';
            document.querySelector('#irma-help-btn').remove();
            document.querySelector('#irma-readmore-btn').remove();
            let btn = document.querySelector('#btn-election-step2');
            btn.className = btn.className.replace('btn-secondary', 'btn-primary');
            options.session.url = options.session.url.replace('disclose', 'issue');

            irmaWeb = irma.newWeb(options);
            irmaWeb
                .start()
                .catch(err => {
                    // TODO: find out why this doesn't get triggered
                    console.log(err);
                    throw err;
                })
                .then(result => {
                    // wait two seconds to display check mark
                    return new Promise(resolve => setTimeout(() => resolve(result), 2000));
                })
                .then(result => {
                    if (result !== 200) throw new Error('issuance failed');
                    console.log('issuance completed');
                });
        })
        .catch(error => {
            console.error('error: ', error);
            if (error.err === 'already got a voting card') irmaWeb.abort('Je hebt al een stemkaart');
        });
}

function onFail() {
    document.querySelector('#election-step').innerText = 'Verkiezing niet gevonden.';
    document.querySelector('#card-header').innerText = 'Verkiezing niet gevonden';
    document.querySelector('#bar').remove();
    document.querySelector('#irma-help-text').innerText = 'Weet u zeker dat de verkiezing bestaat?';
    document.querySelector('#irma-help-btn').remove();
    document.querySelector('#irma-readmore-btn').remove();
    document.querySelector('#irma-web-form').remove();
}

document.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Load all the content from the api
    let url = `/api/v1/election`;
    fetch(url)
        .then(res => {
            if (res.status != 200) throw new Error('not ok');
            return res;
        })
        .then(res => res.json())
        .then(json => {
            options.session.url = `/api/v1/votingcard/${json.id}/disclose`;
            document.querySelector('#election-question').innerText = json.question;
            document.querySelector('#election-date-start').innerText = new Date(json.start).toLocaleDateString(
                'nl-NL',
                {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }
            );
            document.querySelector('#election-date-end').innerText = new Date(json.end).toLocaleDateString('nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.querySelector('#election-step').innerText = step1;
            return json;
        })
        .then(electionData => onElectionData(electionData))
        .catch(onFail);
});
