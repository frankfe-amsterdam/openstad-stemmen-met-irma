const { networkInterfaces } = require('os');
var confDev = require('./conf.json');
var confProd = require('./conf.prod.json');

var configToUse = process.env.NODE_ENV === 'development' ? confDev : confProd;

// validates the configuration read from file
// throws err if the validation is not sufficient to run the server.
function validateConfig(conf) {
    if (!('external_url' in conf)) {
        console.log("no 'external_url' set in config, resolving external ip address (assuming HTTP in dev mode)");
        const nets = networkInterfaces();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    conf.external_url = 'http://' + net.address + ':' + conf.port;
                    if (!('vote_url' in conf)) {
                        conf.vote_url = 'http://' + net.address + ':' + conf.vote_port;
                    }
                    break;
                }
            }
        }
    }
    console.log({ conf });
    return conf;
}

module.exports = validateConfig(configToUse);
