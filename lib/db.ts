import path from 'path'
import fs from 'fs'
import initSqlJs from 'sql.js'

const DB_PATH = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/^sqlite:/, '')
  : path.join(process.cwd(), '.data', 'goa-creator.db')

let dbInstance: SqlDatabase | null = null

type SqlStatement = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run: (...params: any[]) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (...params: any[]) => any | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  all: (...params: any[]) => any[]
}

export type SqlDatabase = {
  exec: (sql: string) => void
  prepare: (sql: string) => SqlStatement
  query: (sql: string) => SqlStatement
  export: () => Uint8Array
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadWasm(): Promise<any> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paths: any[] = [
        path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
        path.join(process.cwd(), 'node_modules', 'sql.js', file),
      ]
      for (const p of paths) {
        if (fs.existsSync(/*turbopackIgnore: true*/ p)) return p
      }
      return path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file)
    },
  })
  return SQL
}

function getDbFileData(): Uint8Array | null {
  try {
    if (fs.existsSync(DB_PATH)) {
      return fs.readFileSync(DB_PATH)
    }
  } catch {
    // File doesn't exist yet
  }
  return null
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
    // Ignore write failures (e.g., read-only filesystem)
  }
}

export async function getDb(): Promise<SqlDatabase> {
  if (dbInstance) return dbInstance

  const SQL = await loadWasm()
  const fileData = getDbFileData()

  const rawDb = fileData ? new SQL.Database(fileData) : new SQL.Database()

  // Add compatibility wrapper for better-sqlite3-style query API
  const query = (sql: string): SqlStatement => {
    const stmt = rawDb.prepare(sql)
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      run: (...params: any[]) => {
        const result = stmt.run(params)
        stmt.reset()
        return result
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: (...params: any[]) => {
        const stmt2 = rawDb.prepare(sql)
        const row = stmt2.get(params)
        const columns = stmt2.getColumnNames()
        stmt2.free()
        if (!row || row.length === 0) return null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj: any = {}
        columns.forEach((col: string, i: number) => { obj[col] = row[i] })
        return obj
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      all: (...params: any[]) => {
        const stmt2 = rawDb.prepare(sql)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows: any[] = []
        if (params.length > 0) {
          stmt2.bind(params)
        }
        while (stmt2.step()) {
          const row = stmt2.get()
          const columns = stmt2.getColumnNames()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const obj: any = {}
          columns.forEach((col: string, i: number) => { obj[col] = row[i] })
          rows.push(obj)
        }
        stmt2.free()
        return rows
      },
    }
  }

  const db: SqlDatabase = {
    exec: (sql: string) => rawDb.exec(sql),
    prepare: (sql: string) => rawDb.prepare(sql),
    query,
    export: () => rawDb.export(),
  }

  dbInstance = db
  return db
}

export function closeDb() {
  if (dbInstance) {
    try {
      saveDbFile(dbInstance)
    } catch {
      // Ignore save errors
    }
    dbInstance = null
  }
}

export const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'business', 'creator')),
  is_verified INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
  location_id TEXT PRIMARY KEY,
  area_name TEXT NOT NULL,
  taluka TEXT NOT NULL,
  district TEXT NOT NULL CHECK (district IN ('North Goa', 'South Goa'))
);

CREATE TABLE IF NOT EXISTS categories (
  category_id TEXT PRIMARY KEY,
  category_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS businesses (
  business_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT DEFAULT '',
  contact_phone TEXT NOT NULL,
  instagram_handle TEXT NOT NULL,
  website_url TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

CREATE TABLE IF NOT EXISTS creators (
  creator_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  accepts_barter INTEGER NOT NULL DEFAULT 0,
  min_paid_rate INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS creator_profiles (
  profile_id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  niche TEXT NOT NULL,
  niche_slug TEXT NOT NULL,
  location TEXT NOT NULL,
  followers TEXT NOT NULL,
  rating REAL NOT NULL DEFAULT 0,
  base_rate TEXT NOT NULL,
  er TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0,
  instagram_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reels (
  reel_id TEXT PRIMARY KEY,
  creator_profile_id TEXT,
  title TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags TEXT NOT NULL DEFAULT '[]',
  audio_track TEXT DEFAULT '',
  category TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  location TEXT NOT NULL,
  video_url TEXT NOT NULL,
  instagram_url TEXT DEFAULT '',
  views TEXT NOT NULL DEFAULT '0',
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_profile_id) REFERENCES creator_profiles(profile_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_niche_slug ON creator_profiles(niche_slug);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_location ON creator_profiles(location);
CREATE INDEX IF NOT EXISTS idx_reels_category_slug ON reels(category_slug);
CREATE INDEX IF NOT EXISTS idx_reels_location ON reels(location);

CREATE TABLE IF NOT EXISTS social_accounts (
  account_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube')),
  platform_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  profile_picture_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TEXT,
  is_connected INTEGER NOT NULL DEFAULT 0,
  connected_at TEXT,
  last_synced_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE (platform, platform_user_id)
);

CREATE TABLE IF NOT EXISTS social_metrics (
  metric_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  following INTEGER NOT NULL DEFAULT 0,
  posts INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  engagement_rate REAL NOT NULL DEFAULT 0,
  avg_likes REAL NOT NULL DEFAULT 0,
  avg_comments REAL NOT NULL DEFAULT 0,
  avg_views REAL NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'creator_submitted' CHECK (source IN ('official_api', 'creator_submitted', 'verified_audit')),
  verified INTEGER NOT NULL DEFAULT 0,
  recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES social_accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS metric_snapshots (
  snapshot_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  engagement_rate REAL NOT NULL DEFAULT 0,
  avg_likes REAL NOT NULL DEFAULT 0,
  avg_comments REAL NOT NULL DEFAULT 0,
  avg_views REAL NOT NULL DEFAULT 0,
  recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES social_accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS collaboration_requests (
  request_id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  compensation_amount INTEGER NOT NULL,
  compensation_type TEXT NOT NULL CHECK (compensation_type IN ('paid', 'barter', 'hybrid')),
  collaboration_type TEXT NOT NULL CHECK (collaboration_type IN ('reel', 'carousel', 'story', 'license', 'hybrid')),
  deliverables TEXT NOT NULL DEFAULT '[]',
  shoot_date TEXT,
  deadline TEXT,
  usage_terms TEXT,
  licensing_terms TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at TEXT,
  FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_collab_requests_creator ON collaboration_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_collab_requests_business ON collaboration_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_collab_requests_status ON collaboration_requests(status);

CREATE TABLE IF NOT EXISTS collaborations (
  collaboration_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_production', 'submitted', 'completed', 'cancelled')),
  campaign_brief TEXT,
  deliverables TEXT NOT NULL DEFAULT '[]',
  deadline TEXT,
  payment_amount INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'released', 'refunded')),
  escrow_locked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  FOREIGN KEY (request_id) REFERENCES collaboration_requests(request_id) ON DELETE CASCADE,
  FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_collaborations_creator ON collaborations(creator_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_business ON collaborations(business_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON collaborations(status);

CREATE TABLE IF NOT EXISTS payments (
  payment_id TEXT PRIMARY KEY,
  collaboration_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  escrow_locked INTEGER NOT NULL DEFAULT 0,
  escrow_released INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collaboration_id) REFERENCES collaborations(collaboration_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  review_id TEXT PRIMARY KEY,
  collaboration_id TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  reviewee_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collaboration_id) REFERENCES collaborations(collaboration_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE (collaboration_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('request_received', 'request_accepted', 'request_declined', 'collaboration_created', 'collaboration_update', 'payment_received', 'review_received', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  link TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
`

export async function initDb() {
  const db = await getDb()
  db.exec(SCHEMA)
  return db
}

export type UserRow = {
  user_id: string
  email: string
  password_hash: string
  role: 'admin' | 'business' | 'creator'
  is_verified: number
  is_active: number
  created_at: string
  updated_at: string
}

export type BusinessRow = {
  business_id: string
  user_id: string
  location_id: string
  business_name: string
  industry: string
  description: string
  contact_phone: string
  instagram_handle: string
  website_url: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type CreatorRow = {
  creator_id: string
  user_id: string
  location_id: string
  full_name: string
  bio: string
  accepts_barter: number
  min_paid_rate: number
  avatar_url?: string
  created_at: string
}

export type LocationRow = {
  location_id: string
  area_name: string
  taluka: string
  district: string
}

export type CategoryRow = {
  category_id: string
  category_name: string
}

export type SessionRow = {
  token: string
  user_id: string
  created_at: string
  expires_at: string
}

export type CreatorProfileRow = {
  profile_id: string
  user_id?: string
  name: string
  handle: string
  niche: string
  niche_slug: string
  location: string
  followers: string
  rating: number
  base_rate: string
  er: string
  verified: number
  instagram_url: string
  bio: string
  avatar_url?: string
  created_at: string
}

export type ReelRow = {
  reel_id: string
  creator_profile_id?: string
  title: string
  caption: string
  hashtags: string
  audio_track: string
  category: string
  category_slug: string
  location: string
  video_url: string
  instagram_url: string
  views: string
  likes: number
  comments: number
  created_at: string
  creator_name?: string | null
  creator_handle?: string | null
  creator_followers?: string | null
  creator_rating?: number | null
  creator_base_rate?: string | null
  creator_er?: string | null
  creator_verified?: number | null
}

export type SocialAccountRow = {
  account_id: string
  user_id: string
  platform: 'instagram' | 'youtube'
  platform_user_id: string
  username: string
  profile_picture_url?: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  is_connected: number
  connected_at?: string
  last_synced_at?: string
  created_at: string
  updated_at: string
}

export type SocialMetricRow = {
  metric_id: string
  account_id: string
  followers: number
  following: number
  posts: number
  likes: number
  comments: number
  shares: number
  impressions: number
  reach: number
  engagement_rate: number
  avg_likes: number
  avg_comments: number
  avg_views: number
  source: 'official_api' | 'creator_submitted' | 'verified_audit'
  verified: number
  recorded_at: string
}

export type MetricSnapshotRow = {
  snapshot_id: string
  account_id: string
  followers: number
  engagement_rate: number
  avg_likes: number
  avg_comments: number
  avg_views: number
  recorded_at: string
}

export type CollaborationRequestRow = {
  request_id: string
  creator_id: string
  business_id: string
  title: string
  objective: string
  compensation_amount: number
  compensation_type: 'paid' | 'barter' | 'hybrid'
  collaboration_type: 'reel' | 'carousel' | 'story' | 'license' | 'hybrid'
  deliverables: string
  shoot_date?: string
  deadline?: string
  usage_terms?: string
  licensing_terms?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  created_at: string
  updated_at: string
  responded_at?: string
}

export type CollaborationRow = {
  collaboration_id: string
  request_id: string
  creator_id: string
  business_id: string
  status: 'pending' | 'accepted' | 'in_production' | 'submitted' | 'completed' | 'cancelled'
  campaign_brief?: string
  deliverables: string
  deadline?: string
  payment_amount: number
  payment_status: 'unpaid' | 'pending' | 'paid' | 'released' | 'refunded'
  escrow_locked: number
  created_at: string
  updated_at: string
  completed_at?: string
}

export type PaymentRow = {
  payment_id: string
  collaboration_id: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  escrow_locked: number
  escrow_released: number
  created_at: string
  updated_at: string
}

export type ReviewRow = {
  review_id: string
  collaboration_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment?: string
  is_verified: number
  created_at: string
  updated_at: string
}

export type NotificationRow = {
  notification_id: string
  user_id: string
  type: 'request_received' | 'request_accepted' | 'request_declined' | 'collaboration_created' | 'collaboration_update' | 'payment_received' | 'review_received' | 'system'
  title: string
  message: string
  is_read: number
  link?: string
  created_at: string
}