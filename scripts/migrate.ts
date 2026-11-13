import { initDb, closeDb } from '@/lib/db'
import fs from 'fs'
import path from 'path'

const JSON_DB_PATH = path.join(process.cwd(), '.data', 'db.json')
const BACKUP_PATH = path.join(process.cwd(), '.data', 'db.json.bak')

export async function migrateJsonToSqlite() {
  const jsonPath = JSON_DB_PATH
  if (!fs.existsSync(jsonPath)) {
    console.log('No JSON database found. Skipping migration.')
    return
  }

  // Backup the original JSON
  fs.copyFileSync(jsonPath, BACKUP_PATH)
  console.log(`Backed up original JSON to ${BACKUP_PATH}`)

  const raw = fs.readFileSync(jsonPath, 'utf-8')
  const data = JSON.parse(raw)

  const db = await initDb()

  try {
    db.exec('BEGIN TRANSACTION')

    // Insert locations
    for (const loc of data.locations || []) {
      db.query(
        'INSERT OR IGNORE INTO locations (location_id, area_name, taluka, district) VALUES (?, ?, ?, ?)'
      ).run(loc.location_id, loc.area_name, loc.taluka, loc.district)
    }

    // Insert categories
    for (const cat of data.categories || []) {
      db.query(
        'INSERT OR IGNORE INTO categories (category_id, category_name) VALUES (?, ?)'
      ).run(cat.category_id, cat.category_name)
    }

    // Insert users
    for (const user of data.users || []) {
      db.query(
        `INSERT OR IGNORE INTO users (user_id, email, password_hash, role, is_verified, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        user.user_id,
        user.email,
        user.password_hash,
        user.role,
        user.is_verified ? 1 : 0,
        user.is_active ? 1 : 0,
        user.created_at,
        user.updated_at
      )
    }

    // Insert businesses
    for (const biz of data.businesses || []) {
      db.query(
        `INSERT OR IGNORE INTO businesses (business_id, user_id, location_id, business_name, industry, description, contact_phone, instagram_handle, website_url, avatar_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        biz.business_id,
        biz.user_id,
        biz.location_id,
        biz.business_name,
        biz.industry,
        biz.description || '',
        biz.contact_phone,
        biz.instagram_handle,
        biz.website_url || '',
        biz.avatar_url || null
      )
    }

    // Insert creators
    for (const cr of data.creators || []) {
      db.query(
        `INSERT OR IGNORE INTO creators (creator_id, user_id, location_id, full_name, bio, accepts_barter, min_paid_rate, avatar_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        cr.creator_id,
        cr.user_id,
        cr.location_id,
        cr.full_name,
        cr.bio || '',
        cr.accepts_barter ? 1 : 0,
        cr.min_paid_rate || 0,
        cr.avatar_url || null,
        cr.created_at
      )
    }

    // Insert sessions
    const sessions = data.sessions || {}
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    for (const [token, userId] of Object.entries(sessions)) {
      db.query(
        'INSERT OR IGNORE INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
      ).run(token, userId, now.toISOString(), expiresAt)
    }

    db.exec('COMMIT')
    console.log('Migration completed successfully.')
  } catch (err) {
    db.exec('ROLLBACK')
    console.error('Migration failed:', err)
    throw err
  } finally {
    closeDb()
  }
}

if (require.main === module) {
  migrateJsonToSqlite()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}