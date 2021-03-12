# IRMA-vote Server A

This package contains a NodeJS server acting as server A for irma-vote.
Server A's main tasks are:

1. Authenticate a user (using IRMA),
2. Decide eligibility using data from step 1 and preconfigured data or (external) database integration,
3. Issue a voting card if eligible.

## Installing and running

To install all decepencies:

```
npm install
```

To run a local irma server (make sure you have the `irma` binary):

```
npm run start_irma_server
```

To run the irma-vote server A (see it's configuration in `config`:

```
npm run start
```

## API

The server exposes endpoints:

- `/election/:name`: `GET` get public info about an election with `name`,
- `/admin`: admin endpoints to create new election:
  - `login/{start,finish}`: `GET` to start and finish an IRMA session to acquire an admin session. The endpoints listed below are accessible with this cookie.
  - `elections`: `GET` responds with an overview of all elections.
  - `new`: `POST` create new elections.
  - `/:id/delete`: `DELETE`
  - `logout`: `DELETE` to end the admin session
- `/votingcard`:
  - `/:id/disclose/{start,finish}`: perform an IRMA disclosure session. After completion, the user might have an authenticated session to get a voting card if the user doesn't have one already.
  - `/:id/issue/{start,finish}`: perform an issuance session to retrieve a voting card, uses the disclosure result in cookie mentioned above as condition.
- `/irma`: This traffic is proxied to a _local_ IRMA server configured in `config/conf.json`.
