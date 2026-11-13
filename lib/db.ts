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