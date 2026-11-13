import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import path from 'path'
import fs from 'fs'
import {
  initDb,
  closeDb,
  type SqlDatabase,
  type UserRow,
  type BusinessRow,
  type CreatorRow,
  type LocationRow,
  type CategoryRow,
} from '@/lib/db'

export type {
  UserRow,
  BusinessRow,
  CreatorRow,
  LocationRow,
  CategoryRow,
}

const DB_PATH = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/^sqlite:/, '')
  : path.join(process.cwd(), '.data', 'goa-creator.db')

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function registerUser(data: {
  email: string
  password: string
  role: 'business' | 'creator'
  businessData?: {
    business_name: string
    industry: string
    location_id: string
    description?: string
    contact_phone: string
    instagram_handle: string
    website_url?: string
  }
  creatorData?: {
    full_name: string
    location_id: string
    bio?: string
    category_id?: string
    accepts_barter: boolean
    min_paid_rate: number
    instagram_handle?: string
  }
}) {
  if (data.password.length < 6) {
    throw new Error('Password must be at least 6 characters.')
  }

  const db = await initDb()
  const emailLower = data.email.trim().toLowerCase()

  const existing = db
    .query('SELECT COUNT(*) as cnt FROM users WHERE email = ?')
    .get(emailLower) as { cnt: number } | null

  if (existing && existing.cnt > 0) {
    closeDb()
    throw new Error('An account with this email already exists.')
  }

  const userId = `usr-${crypto.randomUUID().slice(0, 8)}`
  const now = new Date().toISOString()
  const passwordHash = await hashPassword(data.password)

  const insertUser = db.query(
    `INSERT INTO users (user_id, email, password_hash, role, is_verified, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
  insertUser.run(
    userId,
    emailLower,
    passwordHash,
    data.role,
    0,
    1,
    now,
    now
  )

  if (data.role === 'business' && data.businessData) {
    const insertBiz = db.query(
      `INSERT INTO businesses (business_id, user_id, location_id, business_name, industry, description, contact_phone, instagram_handle, website_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    insertBiz.run(
      `biz-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      data.businessData.location_id,
      data.businessData.business_name,
      data.businessData.industry,
      data.businessData.description || '',
      data.businessData.contact_phone,
      data.businessData.instagram_handle,
      data.businessData.website_url || ''
    )
  } else if (data.role === 'creator' && data.creatorData) {
    const insertCr = db.query(
      `INSERT INTO creators (creator_id, user_id, location_id, full_name, bio, accepts_barter, min_paid_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    insertCr.run(
      `cr-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      data.creatorData.location_id,
      data.creatorData.full_name,
      data.creatorData.bio || '',
      data.creatorData.accepts_barter ? 1 : 0,
      Number(data.creatorData.min_paid_rate) || 0
    )
  }

  // Generate session token
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const insertSession = db.query(
    'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  )
  insertSession.run(token, userId, now, expiresAt)

  saveAndCloseDb(db)

  return {
    user: sanitizeUser({
      user_id: userId,
      email: emailLower,
      password_hash: passwordHash,
      role: data.role,
      is_verified: 0,
      is_active: 1,
      created_at: now,
      updated_at: now,
    }),
    token,
  }
}

export async function loginUser(email: string, password: string) {
  const db = await initDb()
  const emailLower = email.trim().toLowerCase()

  const user = db
    .query('SELECT * FROM users WHERE email = ?')
    .get(emailLower) as UserRow | null

  if (!user) {
    saveAndCloseDb(db)
    throw new Error('Invalid email or password.')
  }

  const passwordValid = await verifyPassword(password, user.password_hash)
  if (!passwordValid) {
    saveAndCloseDb(db)
    throw new Error('Invalid email or password.')
  }

  if (!user.is_active) {
    saveAndCloseDb(db)
    throw new Error('Your account has been deactivated. Please contact support.')
  }

  const token = crypto.randomUUID()
  const now = new Date().toISOString()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const insertSession = db.query(
    'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  )
  insertSession.run(token, user.user_id, now, expiresAt)

  let profile: BusinessRow | CreatorRow | null = null
  if (user.role === 'business') {
    profile = (db
      .query('SELECT * FROM businesses WHERE user_id = ?')
      .get(user.user_id) as BusinessRow | null) ?? null
  } else if (user.role === 'creator') {
    profile = (db
      .query('SELECT * FROM creators WHERE user_id = ?')
      .get(user.user_id) as CreatorRow | null) ?? null
  }

  saveAndCloseDb(db)

  return {
    user: sanitizeUser(user),
    profile,
    token,
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('goa_session')?.value
  if (!token) return null

  const db = await initDb()
  const session = db
    .query(
      'SELECT * FROM sessions WHERE token = ? AND expires_at > ?'
    )
    .get(token, new Date().toISOString()) as { user_id: string } | null

  if (!session) {
    saveAndCloseDb(db)
    return null
  }

  const user = db
    .query('SELECT * FROM users WHERE user_id = ? AND is_active = 1')
    .get(session.user_id) as UserRow | null

  if (!user) {
    saveAndCloseDb(db)
    return null
  }

  let profile: BusinessRow | CreatorRow | null = null
  if (user.role === 'business') {
    profile = (db
      .query('SELECT * FROM businesses WHERE user_id = ?')
      .get(user.user_id) as BusinessRow | null) ?? null
  } else if (user.role === 'creator') {
    profile = (db
      .query('SELECT * FROM creators WHERE user_id = ?')
      .get(user.user_id) as CreatorRow | null) ?? null
  }

  saveAndCloseDb(db)

  return {
    user: sanitizeUser(user),
    profile,
  }
}

export async function logoutUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('goa_session')?.value
  if (token) {
    const db = await initDb()
    db.query('DELETE FROM sessions WHERE token = ?').run(token)
    saveAndCloseDb(db)
  }
}

function saveAndCloseDb(db: SqlDatabase) {
  try {
    saveDbFile(db)
  } catch {
    // Ignore save errors
  }
  closeDb()
}

function sanitizeUser(user: UserRow) {
  const { password_hash, ...rest } = user
  void password_hash
  return rest
}

function saveDbFile(db: SqlDatabase) {
  try {
    const data = db.export()
    const dbDir = path.dirname(DB_PATH)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    fs.writeFileSync(DB_PATH, Buffer.from(data))
  } catch {
    // Ignore save errors
  }
}