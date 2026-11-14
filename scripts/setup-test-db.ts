import { Client } from 'pg'
import { resetDatabase } from './db-reset'
import { seedDatabase } from './seed'
import { closePool } from '../lib/db'

export const TEST_DB_NAME = 'goa_test'
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://goacreator:goacreator_secret_password@localhost:5433/goa_test'
export const MAINTENANCE_DATABASE_URL =
  process.env.DATABASE_URL_BASE ||
  'postgresql://goacreator:goacreator_secret_password@localhost:5433/goacreatordb'

export async function setupTestDatabase() {
  console.log(`Ensuring test database '${TEST_DB_NAME}' exists...`)
  const client = new Client({ connectionString: MAINTENANCE_DATABASE_URL })
  await client.connect()
  try {
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [TEST_DB_NAME])
    if (res.rows.length === 0) {
      console.log(`Database '${TEST_DB_NAME}' does not exist. Creating...`)
      await client.query(`CREATE DATABASE ${TEST_DB_NAME};`)
      console.log(`Database '${TEST_DB_NAME}' created successfully.`)
    } else {
      console.log(`Database '${TEST_DB_NAME}' already exists.`)
    }
  } finally {
    await client.end()
  }

  // Point to test database
  process.env.DATABASE_URL = TEST_DATABASE_URL

  console.log(`Resetting and migrating '${TEST_DB_NAME}'...`)
  await resetDatabase()

  console.log(`Seeding '${TEST_DB_NAME}' with deterministic test fixtures...`)
  await seedDatabase()

  await closePool()
  console.log(`Test database '${TEST_DB_NAME}' is ready for test execution!`)
}

if (import.meta.main || require.main === module) {
  setupTestDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Failed to setup test database:', err)
      process.exit(1)
    })
}
