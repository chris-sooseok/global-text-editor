
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

    // sets WAL (write-ahead logging) mode, which improves reliability and performance
    db.pragma('journal_mode = WAL')
    // enables foreign key rules since sqlite doesn't enable it by default
    db.pragma('foreign_keys = ON')

    return db
}

function migrate() {
  const database = connect_db()
  // get migrations dir
  const migrationsDir = path.join(__dirname, 'migrations')

  if (!fs.existsSync(migrationsDir)) return

  // ensure migrations bookkeeping table exists
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `)

  // read migration files ascending order
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .sort()

  // get already applied files
  const appliedRows = database
    .prepare(`SELECT filename FROM schema_migrations`)
    .all()
  const applied = new Set(appliedRows.map((r) => r.filename))
    
  // apply only files not yet applied, and record them
  const run = database.transaction(() => {
    for (const fName of migrationFiles) {
      if (applied.has(fName)) continue

      // read sql code
      const sql = fs.readFileSync(path.join(migrationsDir, fName), 'utf8')
      database.exec(sql)

      // record applied file
      database
        .prepare(`INSERT INTO schema_migrations (filename, applied_at) VALUES (?, ?)`)
        .run(fName, Date.now())
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
