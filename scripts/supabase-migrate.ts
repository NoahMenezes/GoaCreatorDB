/**
 * scripts/supabase-migrate.ts
 *
 * Runs all SQL migrations in db/migrations/ against the Supabase database.
 *
 * Usage:
 *   bun run scripts/supabase-migrate.ts
 *   # or
 *   npx ts-node scripts/supabase-migrate.ts
 *
 * Requires DATABASE_URL to be set in .env.local pointing to your Supabase DB.
 * Use the "Session mode" connection string (port 5432) — NOT the pooler — for migrations.
 *
 * Session mode URL format (from Supabase → Settings → Database → Connection string):
 *   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
 */

import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

// Load .env.local if running outside Next.js (e.g. via bun/ts-node directly)
// Next.js does this automatically for API routes, but scripts need it manually.
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env.local not found. Make sure DATABASE_URL is set.')
    return
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    const value = rest.join('=').trim()
    if (key && !(key in process.env)) {
      process.env[key.trim()] = value
    }
  }
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set.\n' +
        'Add it to .env.local — use the Session mode (port 5432) connection string from:\n' +
        'Supabase → Project Settings → Database → Connection string → URI'
    )
  }
  return url
}

async function runMigrations() {
  loadEnv()

  const dbUrl = getDatabaseUrl()
  console.log('🔗 Connecting to Supabase database...')

  const client = new Client({ connectionString: dbUrl })
  await client.connect()
  console.log('✅ Connected.\n')

  try {
    // 1. Ensure schema_migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)

    // 2. Fetch already-applied migrations
    const res = await client.query('SELECT version FROM schema_migrations ORDER BY id ASC')
    const applied = new Set(res.rows.map((r: { version: string }) => r.version))

    // 3. Read migration files
    const migrationsDir = path.join(process.cwd(), 'db', 'migrations')
    if (!fs.existsSync(migrationsDir)) {
      console.log('No db/migrations directory found. Nothing to migrate.')
      return
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    if (files.length === 0) {
      console.log('No migration files found in db/migrations/.')
      return
    }

    let count = 0
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`⏭  Skipping (already applied): ${file}`)
        continue
      }

      console.log(`⏳ Applying: ${file} ...`)
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf-8')

      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(`✅ Applied: ${file}`)
        count++
      } catch (err) {
        await client.query('ROLLBACK')
        console.error(`❌ Error in ${file}:`, err)
        throw err
      }
    }

    if (count === 0) {
      console.log('\n✅ Supabase database is already up to date.')
    } else {
      console.log(`\n🎉 Successfully applied ${count} migration(s) to Supabase.`)
    }
  } finally {
    await client.end()
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nMigration failed:', err)
    process.exit(1)
  })
