/**
 * lib/supabase.ts
 *
 * Supabase client helpers for GoaCreatorDB.
 *
 * The project uses the `pg` pool (lib/db.ts) for all direct SQL queries,
 * so DATABASE_URL already points to Supabase's PostgreSQL endpoint.
 *
 * These helpers expose the Supabase JS client for any features that benefit
 * from the Supabase API layer (storage, realtime, auth helpers, etc.).
 *
 * Usage:
 *   import { supabase }        from '@/lib/supabase'   // browser / server component (anon key)
 *   import { supabaseAdmin }   from '@/lib/supabase'   // server-only  (service_role key — never expose to client)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Env validation
// ---------------------------------------------------------------------------
function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `Please add it to .env.local (see .env.example for reference).`
    )
  }
  return value
}

const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

// ---------------------------------------------------------------------------
// Public (anon) client — safe to use in browser & server components
// ---------------------------------------------------------------------------
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// ---------------------------------------------------------------------------
// Admin (service_role) client — SERVER ONLY, never import in client components
// ---------------------------------------------------------------------------
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin

  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
  _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return _supabaseAdmin
}

/** Convenience re-export — only use on the server */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin()
    const value = (client as unknown as Record<string, unknown>)[prop as string]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
