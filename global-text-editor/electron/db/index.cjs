
const fs = require('node:fs') // filesystem module
const path = require('node:path')
const { app } = require('electron')
const Database = require('better-sqlite3')

let db = null

function connect_db() {
    // if db is already connected, reuse it
    if (db) return db

    // creates db path and connect
    const db_path = path.join(app.getPath('userData'), 'app.db')
    db = new Database(db_path)

    // sets WAL (write-ahead logging) mode, which improves reliability/performance
    db.pragma('journal_mode = WAL')
    // enables foreign key rules
    db.pragma('foreign_keys = ON')
    return db
}

function migrate() {
  const database = connect_db()
  // __dirname returns dir of this file
  // get migrations files
  const migrationsDir = path.join(__dirname, 'migrations')
  // if migration folder doesn't exist, stop
  if (!fs.existsSync(migrationsDir)) return

  const migrationFiles = fs
    // read all files in the directory
    .readdirSync(migrationsDir)
    // keeps only files that match the format
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    // order the versions
    .sort() // relies on zero-padded numbers like 001, 002, ...

  // read SQLite's built-in integer called user_version
  // {simple:true} returns only number, not a row object
  const curVersion = database.pragma('user_version', { simple: true })

  // creates a transaction wrapper function which means everything inside either
    // all succeeds and commits, or
    // if anything fails, it rolls back and changes aren't partially applied
  const run = database.transaction(() => {
    for (const f of migrationFiles) {
      const nextVersion = Number(f.split('_')[0]) // "001" -> 1
      // if file is already applied, skip
      if (nextVersion <= curVersion) continue

      // read the file contents into a string
      const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf8')
      // executes the SQL text
      database.exec(sql)
      // updates SQLite's user_version to the version just applied
      database.pragma(`user_version = ${nextVersion}`)
    }
  })

  // run the transaction
  run()
}

function close_db() {
  if (db) {
    db.close()
    db = null
  }
}

module.exports = { connect_db, migrate, close_db }
