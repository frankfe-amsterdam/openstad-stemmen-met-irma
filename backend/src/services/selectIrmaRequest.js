const CREDENTIALS = {
    DEMO: [
        'irma-demo.gemeente.personalData.initials',
        'irma-demo.gemeente.personalData.familyname',
        'irma-demo.gemeente.personalData.dateofbirth',
        'irma-demo.gemeente.address.zipcode'
    ],
    PRODUCTION: [
        'pbdf.gemeente.address.zipcode',
        'pbdf.gemeente.personalData.initials',
        'pbdf.gemeente.personalData.familyname',
        'pbdf.gemeente.personalData.dateofbirth'
    ]
};

function selectIrmaRequest() {
    let sessionRequest = {
        '@context': 'https://irma.app/ld/request/disclosure/v2'
    };
    if (process.env.NODE_ENV === 'development') {
        sessionRequest.disclose = [[[...CREDENTIALS.DEMO]]];
    } else {
        sessionRequest.disclose = [[[...CREDENTIALS.PRODUCTION]]];
    }
    return sessionRequest;
}

module.exports = selectIrmaRequest();
