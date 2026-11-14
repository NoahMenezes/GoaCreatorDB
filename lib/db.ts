import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

export function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ||
    'postgresql://goacreator:goacreator_secret_password@localhost:5433/goacreatordb'
  )
}

const globalForDb = globalThis as unknown as {
  pgPool?: Pool
  currentDbUrl?: string
}

export function getPool(): Pool {
  const dbUrl = getDatabaseUrl()
  if (
    !globalForDb.pgPool ||
    globalForDb.currentDbUrl !== dbUrl ||
    (globalForDb.pgPool as unknown as { ending: boolean; ended: boolean }).ending ||
    (globalForDb.pgPool as unknown as { ending: boolean; ended: boolean }).ended
  ) {
    if (globalForDb.pgPool) {
      try {
        globalForDb.pgPool.end()
      } catch {
        // Ignore end error
      }
    }
    globalForDb.currentDbUrl = dbUrl
    globalForDb.pgPool = new Pool({
      connectionString: dbUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
    isShuttingDown = false
  }
  return globalForDb.pgPool
}

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const activePool = getPool()
    const value = (activePool as unknown as Record<string, unknown>)[prop as string]
    if (typeof value === 'function') {
      return value.bind(activePool)
    }
    return value
  },
})

// Graceful shutdown handling
let isShuttingDown = false

export async function closePool(): Promise<void> {
  if (globalForDb.pgPool) {
    const p = globalForDb.pgPool
    globalForDb.pgPool = undefined
    await p.end()
  }
}

export const closeDb = closePool

if (typeof process !== 'undefined') {
  const handleExit = async () => {
    try {
      await closePool()
    } catch {
      // Ignore exit cleanup error
    }
  }
  process.once('SIGINT', handleExit)
  process.once('SIGTERM', handleExit)
}

export type DbRow = Record<string, any>

/**
 * Execute a query against the PostgreSQL pool.
 */
export async function query<T extends QueryResultRow = DbRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params)
}

/**
 * Transaction helper with optional actor user ID setting for audit trigger.
 * Usage:
 *   await withTransaction(async (client) => { ... })
 *   await withTransaction(userId, async (client) => { ... })
 */
export async function withTransaction<T>(
  fnOrUserId: ((client: PoolClient) => Promise<T>) | number | null | undefined,
  maybeFn?: (client: PoolClient) => Promise<T>
): Promise<T> {
  let fn: (client: PoolClient) => Promise<T>
  let actorUserId: number | null | undefined = null

  if (typeof fnOrUserId === 'function') {
    fn = fnOrUserId
  } else {
    actorUserId = fnOrUserId
    fn = maybeFn!
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    if (actorUserId != null) {
      await client.query("SELECT set_config('app.user_id', $1, true)", [
        actorUserId.toString(),
      ])
    }
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // Ignore rollback failure if connection was lost
    }
    throw error
  } finally {
    client.release()
  }
}

/**
 * Legacy compatibility stub: initDb returns a wrapper or pool query helper
 */
export async function initDb() {
  return {
    query: async (text: string, params?: unknown[]) => {
      const res = await pool.query(text, params)
      return res.rows
    },
    exec: async (text: string) => {
      await pool.query(text)
    },
  }
}

export async function getDb() {
  return initDb()
}

// -----------------------------------------------------------------------------
// Database Row Types (ERD column names & Integer IDs)
// -----------------------------------------------------------------------------

export interface UserRow {
  user_id: number
  email: string
  password_hash: string
  role: 'admin' | 'business' | 'creator'
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface LocationRow {
  location_id: number
  area_name: string
  taluka: string
  district: 'North Goa' | 'South Goa'
}

export interface CategoryRow {
  category_id: number
  category_name: string
}

export interface BusinessRow {
  business_id: number
  user_id: number
  location_id: number
  business_name: string
  industry: string | null
  description: string | null
  contact_phone: string | null
  instagram_handle: string | null
}

export interface CreatorRow {
  creator_id: number
  user_id: number
  location_id: number
  full_name: string
  bio: string | null
  accepts_barter: boolean
  min_paid_rate: number
  created_at: string
}

export interface CreatorCategoryRow {
  creator_id: number
  category_id: number
  is_primary: boolean
}

export interface SocialAccountRow {
  account_id: number
  creator_id: number
  platform: 'instagram' | 'youtube'
  handle: string
  profile_url: string | null
}

export interface CreatorMetricRow {
  metric_id: number
  account_id: number
  follower_count: number
  avg_likes: number | null
  avg_views: number | null
  avg_comments: number | null
  engagement_rate: number | null
  audience_goa_pct: number | null
  data_source: 'self_reported' | 'admin_verified'
  verified_by: number | null
  recorded_at: string
}

export interface CollaborationRequestRow {
  request_id: number
  business_id: number
  creator_id: number
  collab_type: 'paid' | 'barter' | 'hybrid'
  compensation_type?: string
  offered_amount: number
  compensation_amount?: number
  offer_details: string | null
  deliverables: string | null
  collaboration_type?: string
  title?: string
  objective?: string
  message: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  requested_at: string
  responded_at: string | null
  deadline: string
  business_name?: string
  business_email?: string
  creator_name?: string
  creator_email?: string
}

export type SocialMetricRow = CreatorMetricRow

export interface ReviewRow {
  review_id: number
  request_id: number
  reviewer_id: number
  reviewee_id: number
  rating: number
  comment: string | null
  created_at: string
}

export interface ShortlistRow {
  business_id: number
  creator_id: number
  note: string | null
  saved_at: string
}

export interface SessionRow {
  session_id: number
  token: string
  user_id: number
  created_at: string
  expires_at: string
}

export interface PasswordResetTokenRow {
  token_id: number
  user_id: number
  token_hash: string
  expires_at: string
  used_at: string | null
}

export interface AuditLogRow {
  log_id: number
  table_name: string
  record_id: number
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  changed_by: number | null
  changed_at: string
}
