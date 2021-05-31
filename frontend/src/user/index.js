import IrmaCore from '@privacybydesign/irma-core';
import Web from '@privacybydesign/irma-web';
import Client from '@privacybydesign/irma-client';
import '@privacybydesign/irma-css';
import './style.scss';

const OPENSTAD_URL = 'https://irmapilot.cms.special-branch.openstad.amsterdam/';
let cardEl;
let titleEl;
let contentInfoEl;
let contentBodyEl;
let activeStep = 1;

const userAgent = () => {
    if (typeof window === 'undefined') return 'nodejs';
    const navigator = window.navigator;

    if (!!window.MSInputMethodContext && !!document.documentMode) return 'Desktop';

    if (/Android/i.test(navigator.userAgent)) {
        return 'Android';
    }

    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) return 'iOS';

    if (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) return 'iOS';

    return 'Desktop';
};

const isMobile = () => {
    return userAgent() === 'Android' || userAgent() === 'iOS';
};

class IrmaStateChangeCallback {
    constructor({ options }) {
        this.mapping = options.callBackMapping;
    }

    stateChange({ newState, payload }) {
        if (Object.keys(this.mapping).indexOf(newState) !== -1 && typeof this.mapping[newState] === 'function') {
            this.mapping[newState](payload);
        } else if (this.mapping.rest && typeof this.mapping.rest === 'function') {
            this.mapping.rest(payload);
        }
    }

    close() {
        return Promise.resolve();
    }
}

class IrmaAbortOnCancel {
    constructor({ stateMachine }) {
        this.stateMachine = stateMachine;
    }
    stateChange({ newState }) {
        if (newState === 'Cancelled') {
            this.stateMachine.transition('abort');
        }
    }
}

const setClassToShowLogo = isSet => {
    const irmaWebEl = document.querySelector('.irma-web-centered');
    isSet ? irmaWebEl.classList.add('show-logo') : irmaWebEl.classList.remove('show-logo');
};

const callBackMapping = {
    ShowingQRCode: () => {
        setClassToShowLogo(true);
    },
    ShowingQRCodeInstead: () => {
        setClassToShowLogo(true);
    },
    ShowingIrmaButton: () => {
        if (document.querySelector('.irma-web-button')) {
            document.querySelector('.irma-web-button').innerText =
                activeStep === 1 ? 'Aanmelden met IRMA' : 'Zet stempas in IRMA';
        }
    },
    Error: payload => {
        console.log({ payload });
    },
    Aborted: () => {
        onIrmaSessionAborted();
    },
    rest: () => {
        setClassToShowLogo(false);
    }
};

let options = {
    debugging: true,
    element: `${isMobile() ? '#irma-web-form-mobile' : '#irma-web-form'}`,
    callBackMapping,
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

const createIrmaSession = () => {
    const irma = new IrmaCore(options);

    irma.use(Client);
    irma.use(Web);

    if (callBackMapping) {
        irma.use(IrmaStateChangeCallback);
    }
    irma.use(IrmaAbortOnCancel);

    return irma;
};

const removeWithHelpClassIfPresent = () => {
    if (cardEl.classList.contains('with-help')) {
        cardEl.classList.remove('with-help');
    }
    return cardEl;
};

const createFinalScreen = () => {
    cardEl.classList.add('final');
    const titleHTML = "<section class='title'><h1>Gelukt!</h1></section>";
    const paragraphHTML = `<section class="final__paragraph"><p>U kunt stemmen tot en met juni 2021</p></section>`;
    const linkHTML = `<section class="final__button"><a class='linkBtn' href="${OPENSTAD_URL}">Naar stem website</a></section>`;
    cardEl.innerHTML = titleHTML + paragraphHTML + linkHTML;
};

const updateProgressBar = activeStep => {
    const steps = [...document.querySelectorAll('.steps > span')];
    steps.forEach((step, index) => {
        if (activeStep === index + 1) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
            step.classList.add('done');
        }
    });
};

const removeButtonFromContentIfPresent = () => {
    contentInfoEl.querySelector('button')?.remove();
};

const setStep2Content = () => {
    removeButtonFromContentIfPresent();
    titleEl.innerText = '2. Zet uw stempas in IRMA';
    contentBodyEl.innerText =
        'Scan deze QR-code om uw stempas op te halen voor ‘The best of Amsterdam Light Festival’.';
    activeStep++;
    updateProgressBar();
};

const showDisclosureCompleteUI = (irmaSession, result) => {
    contentBodyEl.innerText =
        'Gelukt! Bedankt voor uw aanmelding. U kunt nu verder gaan met de volgende stap om uw stempas in de IRMA-app te zetten.';
    const toNextStepButton = document.createElement('button');
    toNextStepButton.classList.add('primary-button');
    toNextStepButton.innerText = '2. Stempas ophalen';
    toNextStepButton.addEventListener('click', () => {
        createIrmaIssueRequestSession(irmaSession, result);
    });
    contentInfoEl.appendChild(toNextStepButton);
};

const onAlreadyHaveVotingcard = () => {
    removeWithHelpClassIfPresent();
    cardEl.classList.add('final');
    const titleHTML = "<section class='title'><h1>U heeft al een stempas opgehaald</h1></section>";
    const paragraphHTML = `<section class="final__paragraph"><p>Heeft u uw stempas per ongeluk verwijderd?</p></section>`;
    const linkHTML = `<section class="final__button"><a class='linkBtn' href="${OPENSTAD_URL}">Naar stem website</a></section>`;
    cardEl.innerHTML = titleHTML + paragraphHTML + linkHTML;
};

const onIrmaSessionAborted = () => {
    removeWithHelpClassIfPresent();
    cardEl.classList.add('final');
    const titleHTML = "<section class='title'><h1>U heeft de IRMA-sessie onderbroken</h1></section>";
    const paragraphHTML = `<section class="final__paragraph"><p>Wilt u het nogmaals proberen?</p></section>`;
    const linkHTML = `<section class="final__button"><a class='linkBtn' href="/">Klik dan hier</a></section>`;
    cardEl.innerHTML = titleHTML + paragraphHTML + linkHTML;
};

const createIrmaSessionResult = url => {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log({ data });
            return data;
        });
};

const createIrmaIssueRequestSession = (irmaSession, disclosureResult) => {
    if (disclosureResult !== 200) throw new Error('disclosure failed');
    console.log('disclosure completed');
    setStep2Content();
    options.session.url = options.session.url.replace('disclose', 'issue');
    options.session.start = false;

    createIrmaSessionResult(options.session.url + '/start')
        .then(disclosureResult => {
            if (disclosureResult.err) {
                throw Error(disclosureResult.err);
            }
            options.session.mapping = { sessionPtr: () => disclosureResult };

            irmaSession = createIrmaSession();
            irmaSession
                .start()
                .then(() => {
                    console.log('issuance completed');
                    createFinalScreen();
                })
                .catch(err => {
                    console.log({ err });
                    throw err;
                });
        })
        .catch(error => {
            if (error.message === 'already got a voting card') {
                onAlreadyHaveVotingcard();
            }
        });
};

const onElectionData = () => {
    let irmaSession = createIrmaSession();
    irmaSession.start().then(result => {
        showDisclosureCompleteUI(irmaSession, result);
    });
};

const onFail = () => {
    document.querySelector('.card').classList.add('election-not-found');
    document.querySelector('.try-again button').addEventListener('click', () => {
        location.reload();
    });
};

const checkIfMobileAndSetClass = () => {
    isMobile() && document.querySelector('main').classList.add('is-mobile');
};

const setEventListeners = () => {
    document.querySelector('.need-help').addEventListener('click', () => {
        document.querySelector('.need-help').classList.toggle('is-open');
    });
    document.querySelector('.need-help').addEventListener('keydown', e => {
        const key = e.key || e.keyCode;
        if (key === 'Enter' || key === 13 || key === ' ' || key === 32) {
            document.querySelector('.need-help').classList.toggle('is-open');
        }
    });
};

const fetchElectionData = () => {
    let url = `/api/v1/election`;
    fetch(url)
        .then(res => {
            if (res.status != 200) throw new Error('not ok');
            return res;
        })
        .then(res => res.json())
        .then(json => {
            options.session.url = `/api/v1/votingcard/${json.id}/disclose`;
            return json;
        })
        .then(electionData => onElectionData(electionData))
        .catch(onFail);
};

const createRemoveVotingCardsButton = () => {
    const buttonEl = document.createElement('button');
    buttonEl.innerText = 'Verwijder personen';
    buttonEl.addEventListener('click', () => {
        fetch(`/api/v1/admin/1/deleteAll`, { method: 'DELETE' }).then(res => {
            if (res.status === 204) console.log('deleted retrievals');
        });
    });
    document.querySelector('header').appendChild(buttonEl);
};

const init = () => {
    cardEl = document.querySelector('.card');
    titleEl = document.querySelector('h1');
    contentInfoEl = document.querySelector('.content__info');
    contentBodyEl = document.querySelector('.content__info__body');
    checkIfMobileAndSetClass();
    setEventListeners();
    createRemoveVotingCardsButton();
    fetchElectionData();
};

document.addEventListener('DOMContentLoaded', () => {
    init();
});
