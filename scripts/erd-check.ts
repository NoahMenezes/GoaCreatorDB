import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

// Ignored system tables per project requirements
const SYSTEM_TABLES = new Set([
  'sessions',
  'password_reset_tokens',
  'audit_log',
  'schema_migrations',
])

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const envFiles = ['.env', '.env.local', '.env.development']
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('DATABASE_URL=')) {
          const rawVal = trimmed.slice('DATABASE_URL='.length).trim()
          return rawVal.replace(/^["'](.*)["']$/, '$1')
        }
      }
    }
  }

  return 'postgresql://goacreator:goacreator_secret_password@localhost:5433/goacreatordb'
}

interface ErdEntity {
  columns: Set<string>
  primaryKeys: Set<string>
  foreignKeys: Set<string>
}

interface ErdForeignKey {
  sourceTable: string
  sourceColumn: string
  targetTable: string
  targetColumn: string
}

interface ErdModel {
  tables: Record<string, ErdEntity>
  foreignKeys: ErdForeignKey[]
}

function parseEraserFile(filePath: string): ErdModel {
  if (!fs.existsSync(filePath)) {
    throw new Error(`ERD file not found at: ${filePath}`)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const tables: Record<string, ErdEntity> = {}
  const foreignKeys: ErdForeignKey[] = []

  const lines = content.split('\n')
  let currentTable: string | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    // Relationship check (e.g. users.user_id - businesses.user_id or locations.location_id < businesses.location_id)
    const relMatch = line
      .replace(/^\/\/\s*/, '')
      .match(/^([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*([<>-])\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/)

    if (relMatch && !currentTable) {
      const [, leftT, leftC, op, rightT, rightC] = relMatch
      // In eraser diagram syntax:
      // left.pk < right.fk means right references left (1-to-many)
      // left.pk - right.fk means 1-to-1 relationship
      // left.pk > right.fk means left references right
      if (op === '<' || op === '-') {
        foreignKeys.push({
          sourceTable: rightT,
          sourceColumn: rightC,
          targetTable: leftT,
          targetColumn: leftC,
        })
      } else if (op === '>') {
        foreignKeys.push({
          sourceTable: leftT,
          sourceColumn: leftC,
          targetTable: rightT,
          targetColumn: rightC,
        })
      }
      continue
    }

    if (line.startsWith('//')) continue

    // Entity header (e.g. users [icon: user, color: blue] {)
    const tableStart = line.match(/^([a-zA-Z0-9_]+)\s*(?:\[[^\]]*\])?\s*\{/)
    if (tableStart) {
      currentTable = tableStart[1]
      tables[currentTable] = {
        columns: new Set(),
        primaryKeys: new Set(),
        foreignKeys: new Set(),
      }
      continue
    }

    if (line === '}') {
      currentTable = null
      continue
    }

    if (currentTable) {
      const parts = line.split(/\s+/)
      if (parts.length >= 2) {
        const colName = parts[0]
        tables[currentTable].columns.add(colName)
        if (parts.includes('pk')) {
          tables[currentTable].primaryKeys.add(colName)
        }
        if (parts.includes('fk')) {
          tables[currentTable].foreignKeys.add(colName)
        }
      }
    }
  }

  return { tables, foreignKeys }
}

async function runErdCheck() {
  const dbUrl = getDatabaseUrl()
  console.log('='.repeat(70))
  console.log('GoaCreatorDB — ERD Conformance & Drift Verification')
  console.log('='.repeat(70))
  console.log(`Connecting to: ${dbUrl.replace(/:\/\/.*@/, '://***:***@')}\n`)

  // Resolve ERD file path (prefer docs/erd.eraser, fallback to docs/er-diagram.eraser)
  const erdPath = fs.existsSync('docs/erd.eraser')
    ? 'docs/erd.eraser'
    : 'docs/er-diagram.eraser'

  console.log(`Reading ERD definition from: ${erdPath}`)
  const erdModel = parseEraserFile(erdPath)

  const pool = new pg.Pool({ connectionString: dbUrl })

  let driftCount = 0

  try {
    // 1. Fetch live base tables
    const tablesRes = await pool.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC;
    `)

    const liveTables = new Set(
      tablesRes.rows
        .map((r) => r.table_name)
        .filter((t) => !SYSTEM_TABLES.has(t))
    )

    const erdTables = new Set(
      Object.keys(erdModel.tables).filter((t) => !SYSTEM_TABLES.has(t))
    )

    console.log(`\nEvaluating ${erdTables.size} ERD tables against ${liveTables.size} DB base tables...`)

    // Compare Tables
    const tablesInDbNotErd = Array.from(liveTables).filter((t) => !erdTables.has(t))
    const tablesInErdNotDb = Array.from(erdTables).filter((t) => !liveTables.has(t))

    if (tablesInDbNotErd.length > 0) {
      console.error('\n❌ DRIFT FOUND: Tables exist in DB but not in ERD:')
      for (const t of tablesInDbNotErd) {
        console.error(`  - ${t}`)
      }
      driftCount += tablesInDbNotErd.length
    }

    if (tablesInErdNotDb.length > 0) {
      console.error('\n❌ DRIFT FOUND: Tables exist in ERD but not in DB:')
      for (const t of tablesInErdNotDb) {
        console.error(`  - ${t}`)
      }
      driftCount += tablesInErdNotDb.length
    }

    if (tablesInDbNotErd.length === 0 && tablesInErdNotDb.length === 0) {
      console.log('  ✓ Tables match perfectly!')
    }

    // 2. Fetch live columns
    const colsRes = await pool.query<{ table_name: string; column_name: string }>(`
      SELECT c.table_name, c.column_name
      FROM information_schema.columns c
      JOIN information_schema.tables t ON c.table_name = t.table_name AND c.table_schema = t.table_schema
      WHERE c.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY c.table_name, c.ordinal_position;
    `)

    const liveColumnsByTable: Record<string, Set<string>> = {}
    for (const row of colsRes.rows) {
      if (SYSTEM_TABLES.has(row.table_name)) continue
      if (!liveColumnsByTable[row.table_name]) {
        liveColumnsByTable[row.table_name] = new Set()
      }
      liveColumnsByTable[row.table_name].add(row.column_name)
    }

    console.log('\nEvaluating columns per table...')
    for (const table of Array.from(erdTables).sort()) {
      if (!liveTables.has(table)) continue

      const liveCols = liveColumnsByTable[table] || new Set()
      const expectedCols = erdModel.tables[table].columns

      const colsInDbNotErd = Array.from(liveCols).filter((c) => !expectedCols.has(c))
      const colsInErdNotDb = Array.from(expectedCols).filter((c) => !liveCols.has(c))

      if (colsInDbNotErd.length > 0 || colsInErdNotDb.length > 0) {
        console.error(`\n❌ Column drift on table '${table}':`)
        if (colsInDbNotErd.length > 0) {
          console.error(`  Extra in DB: ${colsInDbNotErd.join(', ')}`)
          driftCount += colsInDbNotErd.length
        }
        if (colsInErdNotDb.length > 0) {
          console.error(`  Missing in DB: ${colsInErdNotDb.join(', ')}`)
          driftCount += colsInErdNotDb.length
        }
      } else {
        console.log(`  ✓ Table '${table}': All ${expectedCols.size} columns match.`)
      }
    }

    // 3. Fetch live primary keys
    const pkRes = await pool.query<{ table_name: string; column_name: string }>(`
      SELECT tc.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.ordinal_position;
    `)

    const livePksByTable: Record<string, Set<string>> = {}
    for (const row of pkRes.rows) {
      if (SYSTEM_TABLES.has(row.table_name)) continue
      if (!livePksByTable[row.table_name]) {
        livePksByTable[row.table_name] = new Set()
      }
      livePksByTable[row.table_name].add(row.column_name)
    }

    console.log('\nEvaluating primary keys per table...')
    for (const table of Array.from(erdTables).sort()) {
      if (!liveTables.has(table)) continue

      const livePks = livePksByTable[table] || new Set()
      const expectedPks = erdModel.tables[table].primaryKeys

      const pksInDbNotErd = Array.from(livePks).filter((k) => !expectedPks.has(k))
      const pksInErdNotDb = Array.from(expectedPks).filter((k) => !livePks.has(k))

      if (pksInDbNotErd.length > 0 || pksInErdNotDb.length > 0) {
        console.error(`\n❌ Primary key drift on table '${table}':`)
        if (pksInDbNotErd.length > 0) {
          console.error(`  Extra PK in DB: ${pksInDbNotErd.join(', ')}`)
          driftCount += pksInDbNotErd.length
        }
        if (pksInErdNotDb.length > 0) {
          console.error(`  Missing PK in DB: ${pksInErdNotDb.join(', ')}`)
          driftCount += pksInErdNotDb.length
        }
      } else {
        console.log(`  ✓ Table '${table}': Primary key (${Array.from(expectedPks).join(', ')}) matches.`)
      }
    }

    // 4. Fetch live foreign keys
    const fkRes = await pool.query<{
      source_table: string
      source_column: string
      target_table: string
      target_column: string
    }>(`
      SELECT
        kcu.table_name AS source_table,
        kcu.column_name AS source_column,
        ccu.table_name AS target_table,
        ccu.column_name AS target_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY source_table, source_column;
    `)

    const liveFkSet = new Set(
      fkRes.rows
        .filter((r) => !SYSTEM_TABLES.has(r.source_table) && !SYSTEM_TABLES.has(r.target_table))
        .map((r) => `${r.source_table}.${r.source_column} -> ${r.target_table}.${r.target_column}`)
    )

    const expectedFkSet = new Set(
      erdModel.foreignKeys
        .filter((r) => !SYSTEM_TABLES.has(r.sourceTable) && !SYSTEM_TABLES.has(r.targetTable))
        .map((r) => `${r.sourceTable}.${r.sourceColumn} -> ${r.targetTable}.${r.targetColumn}`)
    )

    console.log('\nEvaluating foreign keys across entities...')
    const fksInDbNotErd = Array.from(liveFkSet).filter((fk) => !expectedFkSet.has(fk))
    const fksInErdNotDb = Array.from(expectedFkSet).filter((fk) => !liveFkSet.has(fk))

    if (fksInDbNotErd.length > 0 || fksInErdNotDb.length > 0) {
      console.error('\n❌ Foreign key drift detected:')
      if (fksInDbNotErd.length > 0) {
        console.error('  Extra FKs in DB:')
        for (const fk of fksInDbNotErd) console.error(`    - ${fk}`)
        driftCount += fksInDbNotErd.length
      }
      if (fksInErdNotDb.length > 0) {
        console.error('  Missing FKs in DB:')
        for (const fk of fksInErdNotDb) console.error(`    - ${fk}`)
        driftCount += fksInErdNotDb.length
      }
    } else {
      console.log(`  ✓ All ${expectedFkSet.size} foreign key relationships match perfectly!`)
    }

    console.log('\n' + '='.repeat(70))
    if (driftCount > 0) {
      console.error(`FAILED: ${driftCount} schema drift issues identified.`)
      console.log('='.repeat(70))
      process.exit(1)
    } else {
      console.log('PASSED: 100% ERD Conformance. No schema drift detected.')
      console.log('='.repeat(70))
      process.exit(0)
    }
  } catch (err) {
    console.error('Fatal error during ERD check:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runErdCheck()

