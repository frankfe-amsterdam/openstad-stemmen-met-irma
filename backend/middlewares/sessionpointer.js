const mung = require('express-mung')
const conf = require('./../config/conf.json')

// Mung (response middleware) to fix the session pointer
function fixSessionPtr(json, _, _) {
  try {
    if (json && 'u' in json && json.u.includes('session')) {
      let sessionPtr = json
      sessionPtr.u = `${conf.external_url}/irma/${sessionPtr.u}`
    }
  } catch (err) {
    console.log(('err during middleware', err))
  }
}

module.exports = mung.json(fixSessionPtr)
