import { Client } from 'pg'
import { runMigrations } from './db-migrate'

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://goacreator:goacreator_secret_password@localhost:5433/goacreatordb'

export async function resetDatabase() {
  console.log('Resetting database schema...')
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()

  try {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE;')
    await client.query('CREATE SCHEMA public;')
    await client.query('GRANT ALL ON SCHEMA public TO public;')
    await client.query('GRANT ALL ON SCHEMA public TO CURRENT_USER;')
    console.log('Public schema dropped and recreated.')
  } finally {
    await client.end()
  }

  console.log('Running migrations from clean slate...')
  await runMigrations()
  console.log('Database reset complete.')
}

if (import.meta.main || require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Database reset failed:', err)
      process.exit(1)
    })
}

