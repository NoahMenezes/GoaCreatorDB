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
  type SessionRow,
} from '@/lib/db'

export type {
  UserRow,
  BusinessRow,
  CreatorRow,
  LocationRow,
  CategoryRow,
  SessionRow,
}

export type SanitizedUser = Omit<UserRow, 'password_hash'>

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number = 401) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// -----------------------------------------------------------------------------
// In-Memory Rate Limiting per IP + Email
// -----------------------------------------------------------------------------
interface RateLimitEntry {
  count: number
  firstAttemptAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5

export function checkRateLimit(key: string): void {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry) return

  if (now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.delete(key)
    return
  }

  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    throw new AuthError('Too many login attempts. Please try again later.', 429)
  }
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, firstAttemptAt: now })
  } else {
    entry.count += 1
  }
}

export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key)
}

export function clearAllRateLimits(): void {
  rateLimitMap.clear()
}

// -----------------------------------------------------------------------------
// Lazy Expired Session Cleanup
// -----------------------------------------------------------------------------
export async function cleanupExpiredSessions(): Promise<number> {
  const res = await query('DELETE FROM sessions WHERE expires_at <= now()')
  return res.rowCount ?? 0
}

// -----------------------------------------------------------------------------
// User Registration
// -----------------------------------------------------------------------------
export interface SocialAccountInput {
  platform: 'instagram' | 'youtube'
  handle: string
  profile_url?: string
}

export interface RegisterUserData {
  email: string
  password: string
  role: 'business' | 'creator' | 'admin'
  location_id?: number | string
  businessData?: {
    business_name: string
    industry?: string
    location_id?: number | string
    description?: string
    contact_phone?: string
    instagram_handle?: string
  }
  creatorData?: {
    full_name: string
    location_id?: number | string
    bio?: string
    category_id?: number | string
    primary_category_id?: number | string
    secondary_category_ids?: (number | string)[]
    categories?: (number | string | { category_id: number | string; is_primary?: boolean })[]
    accepts_barter?: boolean
    min_paid_rate?: number | string
    instagram_handle?: string
    youtube_handle?: string
    social_accounts?: SocialAccountInput[]
  }
}

export async function registerUser(data: RegisterUserData) {
  // Reject role=admin immediately (admins can only be seeded)
  if ((data.role as string) === 'admin') {
    throw new AuthError('Admin accounts cannot be registered.', 403)
  }

  if (data.role !== 'business' && data.role !== 'creator') {
    throw new AuthError('Role must be business or creator.', 400)
  }

  if (!data.email || !data.email.trim()) {
    throw new AuthError('Email is required.', 400)
  }

  if (!data.password || data.password.length < 6) {
    throw new AuthError('Password must be at least 6 characters.', 400)
  }

  const emailLower = data.email.trim().toLowerCase()

  // Duplicate email returns 409
  const existingRes = await query<{ user_id: number }>(
    'SELECT user_id FROM users WHERE email = $1',
    [emailLower]
  )
  if (existingRes.rows.length > 0) {
    throw new AuthError('An account with this email already exists.', 409)
  }

  // Extract and validate location_id (422 otherwise)
  const rawLocId =
    data.location_id ??
    (data.role === 'business'
      ? data.businessData?.location_id
      : data.creatorData?.location_id)

  const locationId = Number(rawLocId)
  if (!rawLocId || isNaN(locationId) || locationId <= 0) {
    throw new AuthError('A valid location_id is required.', 422)
  }

  const locCheck = await query<{ location_id: number }>(
    'SELECT location_id FROM locations WHERE location_id = $1',
    [locationId]
  )
  if (locCheck.rows.length === 0) {
    throw new AuthError('A valid location_id is required.', 422)
  }

  const passwordHash = await hashPassword(data.password)
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  // Execute in ONE transaction
  return withTransaction(async (client) => {
    // 1. Create users row
    const userRes = await client.query<UserRow>(
      `INSERT INTO users (email, password_hash, role, is_verified)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [emailLower, passwordHash, data.role]
    )
    const user = userRes.rows[0]
    const userId = user.user_id

    let profile: BusinessRow | CreatorRow | null = null

    if (data.role === 'business') {
      const bData = data.businessData || { business_name: 'Unnamed Business' }
      const bizRes = await client.query<BusinessRow>(
        `INSERT INTO businesses (
           user_id, location_id, business_name, industry, description,
           contact_phone, instagram_handle
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          locationId,
          bData.business_name || 'Business',
          bData.industry || null,
          bData.description || null,
          bData.contact_phone || null,
          bData.instagram_handle || null,
        ]
      )
      profile = bizRes.rows[0]
    } else if (data.role === 'creator') {
      const cData = data.creatorData || { full_name: 'Unnamed Creator' }
      const creatorRes = await client.query<CreatorRow>(
        `INSERT INTO creators (
           user_id, location_id, full_name, bio, accepts_barter, min_paid_rate
         ) VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          userId,
          locationId,
          cData.full_name || 'Creator',
          cData.bio || null,
          cData.accepts_barter ?? false,
          cData.min_paid_rate != null ? Number(cData.min_paid_rate) : 0,
        ]
      )
      profile = creatorRes.rows[0]
      const creatorId = profile.creator_id

      // Determine category IDs: exactly one primary
      const primaryCatId =
        cData.primary_category_id ??
        cData.category_id ??
        (Array.isArray(cData.categories) && cData.categories.length > 0
          ? typeof cData.categories[0] === 'object'
            ? cData.categories[0].category_id
            : cData.categories[0]
          : null)

      let resolvedPrimaryCatId = Number(primaryCatId)
      if (!resolvedPrimaryCatId || isNaN(resolvedPrimaryCatId)) {
        // Fallback to first existing category
        const defaultCatRes = await client.query<{ category_id: number }>(
          'SELECT category_id FROM categories ORDER BY category_id ASC LIMIT 1'
        )
        resolvedPrimaryCatId = defaultCatRes.rows[0].category_id
      }

      await client.query(
        `INSERT INTO creator_categories (creator_id, category_id, is_primary)
         VALUES ($1, $2, true)`,
        [creatorId, resolvedPrimaryCatId]
      )

      // Insert any secondary categories
      const secondaryCatIds: number[] = []
      if (Array.isArray(cData.secondary_category_ids)) {
        for (const sec of cData.secondary_category_ids) {
          const num = Number(sec)
          if (num && num !== resolvedPrimaryCatId && !secondaryCatIds.includes(num)) {
            secondaryCatIds.push(num)
          }
        }
      }
      if (Array.isArray(cData.categories)) {
        for (let i = 1; i < cData.categories.length; i++) {
          const item = cData.categories[i]
          const num = typeof item === 'object' ? Number(item.category_id) : Number(item)
          if (num && num !== resolvedPrimaryCatId && !secondaryCatIds.includes(num)) {
            secondaryCatIds.push(num)
          }
        }
      }

      for (const secId of secondaryCatIds) {
        await client.query(
          `INSERT INTO creator_categories (creator_id, category_id, is_primary)
           VALUES ($1, $2, false)
           ON CONFLICT DO NOTHING`,
          [creatorId, secId]
        )
      }

      // Insert social accounts
      const socialList: SocialAccountInput[] = []
      if (Array.isArray(cData.social_accounts)) {
        socialList.push(...cData.social_accounts)
      }
      if (cData.instagram_handle) {
        socialList.push({
          platform: 'instagram',
          handle: cData.instagram_handle,
        })
      }
      if (cData.youtube_handle) {
        socialList.push({
          platform: 'youtube',
          handle: cData.youtube_handle,
        })
      }

      const insertedPlatforms = new Set<string>()
      for (const sa of socialList) {
        const platform = sa.platform
        if (platform !== 'instagram' && platform !== 'youtube') continue
        if (insertedPlatforms.has(platform)) continue

        const cleanHandle = sa.handle.trim().startsWith('@')
          ? sa.handle.trim()
          : `@${sa.handle.trim()}`
        const profileUrl =
          sa.profile_url ||
          (platform === 'instagram'
            ? `https://instagram.com/${cleanHandle.replace('@', '')}`
            : `https://youtube.com/${cleanHandle}`)

        await client.query(
          `INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [creatorId, platform, cleanHandle, profileUrl]
        )
        insertedPlatforms.add(platform)
      }
    }

    // 2. Create session
    await client.query(
      `INSERT INTO sessions (token, user_id, expires_at)
       VALUES ($1, $2, $3)`,
      [token, userId, expiresAt]
    )

    return {
      user: sanitizeUser(user),
      profile,
      token,
    }
  })
}

// -----------------------------------------------------------------------------
// User Login & Logout
// -----------------------------------------------------------------------------
export async function loginUser(email: string, password: string, clientIp: string = '127.0.0.1') {
  if (!email || !password) {
    throw new AuthError('Invalid email or password.', 401)
  }

  const emailLower = email.trim().toLowerCase()
  const rateLimitKey = `${clientIp}:${emailLower}`

  // 1. In-memory rate limiting check
  checkRateLimit(rateLimitKey)

  // 2. Lazy cleanup of expired sessions
  try {
    await cleanupExpiredSessions()
  } catch {
    // Non-blocking cleanup
  }

  // 3. User lookup
  const userRes = await query<UserRow>(
    'SELECT * FROM users WHERE email = $1',
    [emailLower]
  )
  const user = userRes.rows[0]

  // Generic invalid credentials error to avoid email enumeration
  if (!user) {
    recordFailedAttempt(rateLimitKey)
    throw new AuthError('Invalid email or password.', 401)
  }

  const passwordValid = await verifyPassword(password, user.password_hash)
  if (!passwordValid) {
    recordFailedAttempt(rateLimitKey)
    throw new AuthError('Invalid email or password.', 401)
  }

  // Reset rate limit on successful authentication
  resetRateLimit(rateLimitKey)

  // 4. Create new 7-day session in Postgres sessions table
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

export async function logoutUser(tokenOverride?: string) {
  let token = tokenOverride
  if (!token) {
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('goa_session')?.value
    } catch {
      // Ignore if outside cookie context
    }
  }

  if (token) {
    await query('DELETE FROM sessions WHERE token = $1', [token])
  }
}

// -----------------------------------------------------------------------------
// Session & Auth Helpers: getSession(), requireUser(), requireRole(...roles)
// -----------------------------------------------------------------------------
export interface SessionData {
  session: SessionRow
  user: SanitizedUser
  profile: BusinessRow | CreatorRow | null
  creatorId?: number
  businessId?: number
}

let testSessionToken: string | null = null

export function setTestSessionToken(token: string | null): void {
  testSessionToken = token
}

export function getTestSessionToken(): string | null {
  return testSessionToken
}

export async function getSession(tokenOverride?: string): Promise<SessionData | null> {
  let token: string | undefined = tokenOverride || testSessionToken || undefined
  if (!token) {
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('goa_session')?.value
    } catch {
      // In standalone tests or non-request contexts
    }
  }

  if (!token) return null

  const sessionRes = await query<{
    session_id: number
    token: string
    user_id: number
    session_created_at: string
    expires_at: string
    email: string
    role: 'admin' | 'business' | 'creator'
    is_verified: boolean
    created_at: string
    updated_at: string
  }>(
    `SELECT s.session_id, s.token, s.user_id, s.created_at AS session_created_at, s.expires_at,
            u.email, u.role, u.is_verified, u.created_at, u.updated_at
     FROM sessions s
     JOIN users u ON s.user_id = u.user_id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [token]
  )

  const row = sessionRes.rows[0]
  if (!row) return null

  const user: SanitizedUser = {
    user_id: row.user_id,
    email: row.email,
    role: row.role,
    is_verified: row.is_verified,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }

  const session: SessionRow = {
    session_id: row.session_id,
    token: row.token,
    user_id: row.user_id,
    created_at: row.session_created_at,
    expires_at: row.expires_at,
  }

  let profile: BusinessRow | CreatorRow | null = null
  let creatorId: number | undefined
  let businessId: number | undefined

  if (user.role === 'business') {
    const bizRes = await query<BusinessRow>(
      'SELECT * FROM businesses WHERE user_id = $1',
      [user.user_id]
    )
    profile = bizRes.rows[0] ?? null
    businessId = profile?.business_id
  } else if (user.role === 'creator') {
    const crRes = await query<CreatorRow>(
      'SELECT * FROM creators WHERE user_id = $1',
      [user.user_id]
    )
    profile = crRes.rows[0] ?? null
    creatorId = profile?.creator_id
  }

  return {
    session,
    user,
    profile,
    creatorId,
    businessId,
  }
}

export const getSessionUser = getSession

export async function requireUser(tokenOverride?: string): Promise<SessionData> {
  const sessionData = await getSession(tokenOverride)
  if (!sessionData) {
    throw new AuthError('Authentication required', 401)
  }
  return sessionData
}

export interface RoleAuthResult extends SessionData {
  role: 'admin' | 'business' | 'creator'
}

/**
 * requireRole(...roles)
 * Returns the caller's creatorId or businessId from the database so route handlers
 * never rely on client-supplied owner IDs.
 */
export async function requireRole(
  ...roles: ('admin' | 'business' | 'creator')[]
): Promise<RoleAuthResult> {
  const sessionData = await requireUser()
  const { user } = sessionData

  if (roles.length > 0 && !roles.includes(user.role)) {
    throw new AuthError(`Forbidden: requires role ${roles.join(' or ')}`, 403)
  }

  return {
    ...sessionData,
    role: user.role,
    creatorId: sessionData.creatorId,
    businessId: sessionData.businessId,
  }
}

export async function requireRoleForToken(
  token: string,
  ...roles: ('admin' | 'business' | 'creator')[]
): Promise<RoleAuthResult> {
  const sessionData = await requireUser(token)
  const { user } = sessionData

  if (roles.length > 0 && !roles.includes(user.role)) {
    throw new AuthError(`Forbidden: requires role ${roles.join(' or ')}`, 403)
  }

  return {
    ...sessionData,
    role: user.role,
    creatorId: sessionData.creatorId,
    businessId: sessionData.businessId,
  }
}

export function sanitizeUser(user: UserRow): SanitizedUser {
  const { password_hash, ...rest } = user
  void password_hash
  return rest
}
