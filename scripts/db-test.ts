import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ||
    'postgresql://goacreator:goacreator_secret_password@localhost:5433/goacreatordb'
  )
}

export async function runTests() {
  const dbUrl = getDatabaseUrl()
  console.log(`Starting GoaCreatorDB Test Suite on ${dbUrl}...\n`)
  const client = new Client({ connectionString: dbUrl })
  await client.connect()

  let totalTests = 0
  let passedTests = 0
  let failedTests = 0

  try {
    const testsDir = path.join(process.cwd(), 'db', 'tests')
    if (!fs.existsSync(testsDir)) {
      console.log('No db/tests directory found.')
      return
    }

    const testFiles = fs
      .readdirSync(testsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    for (const file of testFiles) {
      console.log(`\n--- Running: ${file} ---`)
      const filePath = path.join(testsDir, file)
      const sql = fs.readFileSync(filePath, 'utf-8')

      try {
        const res = await client.query(sql)
        const rows = Array.isArray(res) ? res[res.length - 1].rows : res.rows

        if (rows && rows.length > 0) {
          for (const row of rows) {
            totalTests++
            if (row.status === 'PASS') {
              passedTests++
              console.log(`  [PASS] ${row.test_name}: ${row.message || 'OK'}`)
            } else {
              failedTests++
              console.error(`  [FAIL] ${row.test_name}: ${row.message || 'FAILED'}`)
            }
          }
        } else {
          console.log(`  [INFO] File ${file} completed without returning test rows.`)
        }
      } catch (err) {
        failedTests++
        totalTests++
        console.error(`  [FAIL] Uncaught execution error in ${file}:`, err)
      }
    }

    console.log('\n======================================================')
    console.log(`Test Execution Summary:`)
    console.log(`  Total Tests Run : ${totalTests}`)
    console.log(`  Passed          : ${passedTests}`)
    console.log(`  Failed          : ${failedTests}`)
    console.log('======================================================\n')

    if (failedTests > 0) {
      throw new Error(`${failedTests} test(s) failed.`)
    }
  } finally {
    await client.end()
  }
}

if (import.meta.main || require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message || err)
      process.exit(1)
    })
}

