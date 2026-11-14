import { TEST_DATABASE_URL } from '@/scripts/setup-test-db'

export async function ensureApiTestDatabase() {
  process.env.DATABASE_URL = TEST_DATABASE_URL
}
