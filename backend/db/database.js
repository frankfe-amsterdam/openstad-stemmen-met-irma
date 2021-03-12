const sqlite3 = require('better-sqlite3')

const conf = require('./../config/conf.json')

// Connect to the database and initialize it
let db = new sqlite3(conf.database_file)

// Create a table and insert initial count
db.transaction(() => {
  // Create the elections table
  // Stores id, readable name, question, options, (start/end) date, nr of participants, creation date.
  try {
    db.prepare(
      `CREATE TABLE IF NOT EXISTS elections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        start DATE NOT NULL,
        end DATE NOT NULL,
        participants INTEGER NOT NULL,
        creation DATETIME DEFAULT (DATETIME('now')),
        UNIQUE(name)
      );`
    ).run()
  } catch (err) {
    if (err && err.code != 'SQLITE_CONSTRAINT') {
      console.log(err)
      throw err
    }
  }

  // Insert a sample election
  try {
    db.prepare(
      `INSERT INTO elections (name, question, options, start, end, participants) VALUES (?, ?, ?, ?, ?, ?);
    `
    ).run([
      'radboudgebouw',
      'Wat wordt de naam van het nieuwe universiteitsgebouw?',
      'Optie 1,Optie 3,Optie 3',
      '2021-2-28',
      '2021-3-7',
      '0',
    ])
  } catch (err) {
    if (err && err.code != 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(err)
      throw err
    }
  }

  // Create the voting card table
  try {
    db.prepare(
      `
    CREATE TABLE IF NOT EXISTS votingcards (
      id INTEGER,
      identity TEXT NOT NULL,
      FOREIGN KEY(id) REFERENCES elections(id)
    )`
    ).run()
  } catch (err) {
    console.log(err)
    throw err
  }
})()

module.exports = db
