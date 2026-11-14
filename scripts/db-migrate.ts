import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ||
    'postgresql://goacreator:goacreator_secret_password@localhost:5433/goacreatordb'
  )
}

export async function runMigrations() {
  const dbUrl = getDatabaseUrl()
  const client = new Client({ connectionString: dbUrl })
  await client.connect()

  try {
    // 1. Ensure schema_migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)

    // 2. Fetch applied migrations
    const res = await client.query('SELECT version FROM schema_migrations ORDER BY id ASC')
    const applied = new Set(res.rows.map((r: { version: string }) => r.version))

    // 3. Read migration files
    const migrationsDir = path.join(process.cwd(), 'db', 'migrations')
    if (!fs.existsSync(migrationsDir)) {
      console.log('No db/migrations directory found.')
      return
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    let count = 0
    for (const file of files) {
      if (!applied.has(file)) {
        console.log(`Applying migration: ${file}...`)
        const filePath = path.join(migrationsDir, file)
        const sql = fs.readFileSync(filePath, 'utf-8')

        await client.query('BEGIN')
        try {
          await client.query(sql)
          await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file])
          await client.query('COMMIT')
          console.log(`  ✓ Applied ${file}`)
          count++
        } catch (err) {
          await client.query('ROLLBACK')
          console.error(`  ✗ Error in ${file}:`, err)
          throw err
        }
      }
    }

    if (count === 0) {
      console.log('Database is up to date. No pending migrations.')
    } else {
      console.log(`Successfully applied ${count} migration(s).`)
    }
  } finally {
    await client.end()
  }
}

if (import.meta.main || require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err)
      process.exit(1)
    })
}

