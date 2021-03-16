const express = require('express')
const conf = require('./../config/conf.json')
const IrmaBackend = require('@privacybydesign/irma-backend')

const irmaBackend = new IrmaBackend(conf.irma.url, {
  serverToken: conf.irma.auth_token,
})

var router = express.Router()

// Below are two routes that complete a disclosure session
// to get the necessary attributes to decide eligibility.
router.get('/:id/disclose/start', (req, res) => {
  // Stores user session data per election, create if doesnt exist
  req.session.electionData = req.session.electionData || {}

  console.log(req.session.electionData)
  let data = (req.session.electionData[req.params.id] = {})

  irmaBackend
    .startSession({
      '@context': 'https://irma.app/ld/request/disclosure/v2',
      disclose: [
        [
          [
            'irma-demo.gemeente.personalData.initials',
            'irma-demo.gemeente.personalData.familyname',
            'irma-demo.gemeente.personalData.dateofbirth',
          ],
        ],
      ],
    })
    .then(({ sessionPtr, token }) => {
      data.discloseToken = token
      data.authenticated = false
      res.status(200).json(sessionPtr).end()
    })
    .catch((err) => {
      console.log(err)
      res.status(405).json({ error: err.message }).end()
    })
})

router.get('/:id/disclose/finish', (req, res) => {
  let data = req.session.electionData[req.params.id]

  // Use token from /start to retrieve session results from IRMA server
  if (!data.discloseToken)
    return res
      .status(403)
      .json({ err: 'no disclosure started yet for this session' })

  return irmaBackend
    .getSessionResult(data.discloseToken)
    .then((result) => {
      if (!(result.proofStatus === 'VALID' && result.status === 'DONE'))
        throw new Error('not valid or session not finished yet')

      let getValue = (result, id) =>
        result.disclosed[0].filter(
          (attr) => attr.id == id && attr.status == 'PRESENT'
        )[0].rawvalue

      let ids = [
        'irma-demo.gemeente.personalData.initials',
        'irma-demo.gemeente.personalData.familyname',
        'irma-demo.gemeente.personalData.dateofbirth',
      ]

      data.disclosed = {}
      ids.forEach((attributeId) => {
        data.disclosed[attributeId] = getValue(result, attributeId)
      })

      console.log(data)
      // TODO: check database if disclosed identity is allowed to vote

      // Let's say the user is allowed a voting card
      data.authenticated = true

      return res.status(200).end()
    })
    .catch((err) => res.status(405).json({ err: err.message }))
})

// Below are two routes for issuance of a voting card
router.get('/:id/issue/start', (req, res) => {
  let data = req.session.electionData[req.params.id]
  let identity = JSON.stringify(data.disclosed)

  if (!data.authenticated) return res.status(403).json({ err: 'not permitted' })

  try {
    let exists = req.db
      .prepare(`SELECT * FROM votingcards WHERE id = ? AND identity = ?`)
      .get(req.params.id, identity)
    console.log(exists)
    if (exists) throw new Error('already got a voting card')

    let row = req.db
      .prepare('SELECT name, start, end FROM elections WHERE id = ?')
      .get(req.params.id)

    console.log(row)

    irmaBackend
      .startSession({
        '@context': 'https://irma.app/ld/request/issuance/v2',
        credentials: [
          {
            credential: 'irma-demo.stemmen.stempas',
            attributes: {
              election: row.name,
              voteURL: `${conf.vote_url}/?name=${row.name}`,
              start: row.start,
              end: row.end,
            },
          },
        ],
      })
      .then(({ sessionPtr, token }) => {
        data.issueToken = token
        return res.status(200).json(sessionPtr)
      })
      .catch((err) => {
        throw err
      })
  } catch (err) {
    res.status(400).json({ err: err.message }).end()
  }
})

router.get('/:id/issue/finish', (req, res) => {
  // Check if the session is completed successfully. If so,
  // register that this user has retrieved her voting card.
  // Update database accordingly.
  let data = req.session.electionData[req.params.id]

  try {
    irmaBackend
      .getSessionStatus(data.issueToken)
      .then((result) => {
        console.log(result)
        req.db.transaction(() => {
          req.db
            .prepare(`INSERT INTO votingcards (id, identity) VALUES (?, ?);`)
            .run([req.params.id, JSON.stringify(data.disclosed)])

          console.log(
            `id: ${req.params.id}, identity: ${JSON.stringify(data.disclosed)}`
          )

          req.db
            .prepare(
              `UPDATE elections SET participants = participants + 1 WHERE id = ?`
            )
            .run(req.params.id)
        })()
        res.status(200).json({ msg: 'success' }).end()
      })
      .catch((err) => {
        throw err
      })
  } catch (err) {
    res.status(400).json({ err: err.message }).end()
  }
})

router.get('/:name/vote', (req, res) => {
  res.redirect(307, `${conf.vote_url}/?name=${req.params.name}`)
})

module.exports = router
