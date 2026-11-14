import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import {
  query,
  withTransaction,
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
    location_id: number | string
    description?: string
    contact_phone: string
    instagram_handle: string
    website_url?: string
  }
  creatorData?: {
    full_name: string
    location_id: number | string
    bio?: string
    category_id?: number | string
    accepts_barter: boolean
    min_paid_rate: number
    instagram_handle?: string
  }
}) {
  if (data.password.length < 6) {
    throw new Error('Password must be at least 6 characters.')
  }

  const emailLower = data.email.trim().toLowerCase()

  const existingRes = await query(
    'SELECT user_id FROM users WHERE email = $1',
    [emailLower]
  )

  if (existingRes.rows.length > 0) {
    throw new Error('An account with this email already exists.')
  }

  const passwordHash = await hashPassword(data.password)
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return withTransaction(async (client) => {
    const userRes = await client.query<UserRow>(
      `INSERT INTO users (email, password_hash, role, is_verified)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [emailLower, passwordHash, data.role]
    )
    const user = userRes.rows[0]
    const userId = user.user_id

    if (data.role === 'business' && data.businessData) {
      const locId = Number(data.businessData.location_id) || 1
      await client.query(
        `INSERT INTO businesses (user_id, location_id, business_name, industry, description, contact_phone, instagram_handle)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          locId,
          data.businessData.business_name,
          data.businessData.industry,
          data.businessData.description || '',
          data.businessData.contact_phone,
          data.businessData.instagram_handle,
        ]
      )
    } else if (data.role === 'creator' && data.creatorData) {
      const locId = Number(data.creatorData.location_id) || 1
      const creatorRes = await client.query<{ creator_id: number }>(
        `INSERT INTO creators (user_id, location_id, full_name, bio, accepts_barter, min_paid_rate)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING creator_id`,
        [
          userId,
          locId,
          data.creatorData.full_name,
          data.creatorData.bio || '',
          data.creatorData.accepts_barter,
          Number(data.creatorData.min_paid_rate) || 0,
        ]
      )
      const creatorId = creatorRes.rows[0].creator_id

      if (data.creatorData.category_id) {
        const catId = Number(data.creatorData.category_id) || 1
        await client.query(
          `INSERT INTO creator_categories (creator_id, category_id, is_primary)
           VALUES ($1, $2, true)
           ON CONFLICT DO NOTHING`,
          [creatorId, catId]
        )
      }

      if (data.creatorData.instagram_handle) {
        const handle = data.creatorData.instagram_handle.replace(/^@/, '')
        await client.query(
          `INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
           VALUES ($1, 'instagram', $2, $3)
           ON CONFLICT DO NOTHING`,
          [creatorId, handle, `https://instagram.com/${handle}`]
        )
      }
    }

    await client.query(
      `INSERT INTO sessions (token, user_id, expires_at)
       VALUES ($1, $2, $3)`,
      [token, userId, expiresAt]
    )

    return {
      user: sanitizeUser(user),
      token,
    }
  })
}

export async function loginUser(email: string, password: string) {
  const emailLower = email.trim().toLowerCase()

  const userRes = await query<UserRow>(
    'SELECT * FROM users WHERE email = $1',
    [emailLower]
  )

  const user = userRes.rows[0]
  if (!user) {
    throw new Error('Invalid email or password.')
  }

  const passwordValid = await verifyPassword(password, user.password_hash)
  if (!passwordValid) {
    throw new Error('Invalid email or password.')
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await query(
    `INSERT INTO sessions (token, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [token, user.user_id, expiresAt]
  )

  let profile: BusinessRow | CreatorRow | null = null
  if (user.role === 'business') {
    const bizRes = await query<BusinessRow>(
      'SELECT * FROM businesses WHERE user_id = $1',
      [user.user_id]
    )
    profile = bizRes.rows[0] ?? null
  } else if (user.role === 'creator') {
    const crRes = await query<CreatorRow>(
      'SELECT * FROM creators WHERE user_id = $1',
      [user.user_id]
    )
    profile = crRes.rows[0] ?? null
  }

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

  const sessionRes = await query<{
    user_id: number
    email: string
    password_hash: string
    role: 'admin' | 'business' | 'creator'
    is_verified: boolean
    created_at: string
    updated_at: string
  }>(
    `SELECT u.*
     FROM sessions s
     JOIN users u ON s.user_id = u.user_id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [token]
  )

  const user = sessionRes.rows[0]
  if (!user) {
    return null
  }

  let profile: BusinessRow | CreatorRow | null = null
  if (user.role === 'business') {
    const bizRes = await query<BusinessRow>(
      'SELECT * FROM businesses WHERE user_id = $1',
      [user.user_id]
    )
    profile = bizRes.rows[0] ?? null
  } else if (user.role === 'creator') {
    const crRes = await query<CreatorRow>(
      'SELECT * FROM creators WHERE user_id = $1',
      [user.user_id]
    )
    profile = crRes.rows[0] ?? null
  }

  return {
    user: sanitizeUser(user),
    profile,
  }
}

export async function logoutUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('goa_session')?.value
  if (token) {
    await query('DELETE FROM sessions WHERE token = $1', [token])
  }
}

export function sanitizeUser(user: UserRow) {
  const { password_hash, ...rest } = user
  void password_hash
  return rest
}
