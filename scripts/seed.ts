import { initDb, closeDb } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { goaCreators, goaReelsPool } from '@/lib/showcase-data'

export async function seedShowcaseData() {
  const db = await initDb()

  try {
    db.exec('BEGIN TRANSACTION')

    // Seed demo users with proper bcrypt password hashes
    const demoUsers = [
      {
        user_id: 'usr-palmeira',
        email: 'palmeira@goaconnect.in',
        password: 'business123',
        role: 'business' as const,
      },
      {
        user_id: 'usr-rahul',
        email: 'rahul@goaconnect.in',
        password: 'creator123',
        role: 'creator' as const,
      },
    ]

    const now = new Date().toISOString()

    for (const u of demoUsers) {
      const existing = db
        .query('SELECT COUNT(*) as cnt FROM users WHERE email = ?')
        .get(u.email) as { cnt: number } | null

      if (existing && existing.cnt > 0) continue

      const passwordHash = await hashPassword(u.password)
      db.query(
        `INSERT INTO users (user_id, email, password_hash, role, is_verified, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        u.user_id,
        u.email,
        passwordHash,
        u.role,
        1,
        1,
        now,
        now
      )
    }

    // Seed business profile for Palmeira
    const bizExists = db
      .query('SELECT COUNT(*) as cnt FROM businesses WHERE user_id = ?')
      .get('usr-palmeira') as { cnt: number } | null

    if (!bizExists || bizExists.cnt === 0) {
      db.query(
        `INSERT INTO businesses (business_id, user_id, location_id, business_name, industry, description, contact_phone, instagram_handle, website_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'biz-palmeira',
        'usr-palmeira',
        'loc-2',
        'Café Palmeira',
        'Food & Dining',
        'Authentic Portuguese-Goan bistro in Calangute with artisan sourdough & coffee.',
        '+91 98221 44556',
        '@cafepalmeiragoa',
        'https://cafepalmeira.in',
        now,
        now
      )
    }

    // Seed creator profile for Rahul
    const crExists = db
      .query('SELECT COUNT(*) as cnt FROM creators WHERE user_id = ?')
      .get('usr-rahul') as { cnt: number } | null

    if (!crExists || crExists.cnt === 0) {
      db.query(
        `INSERT INTO creators (creator_id, user_id, location_id, full_name, bio, accepts_barter, min_paid_rate, avatar_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        'cr-rahul',
        'usr-rahul',
        'loc-1',
        'Rahul Naik',
        'Documenting Goan tavernas, Portuguese bakeries, and coastal culinary bars.',
        1,
        8500,
        null,
        now
      )
    }

    // Seed creator_profiles from showcase data
    const existingProfiles = db
      .query('SELECT COUNT(*) as count FROM creator_profiles')
      .get() as { count: number } | null

    if (!existingProfiles || existingProfiles.count === 0) {
      const insertProfile = db.query(
        `INSERT INTO creator_profiles (profile_id, name, handle, niche, niche_slug, location, followers, rating, base_rate, er, verified, instagram_url, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )

      for (const c of goaCreators) {
        insertProfile.run(
          c.id,
          c.name,
          c.handle,
          c.niche,
          c.nicheSlug,
          c.location,
          c.followers,
          c.rating,
          c.baseRate,
          c.er,
          c.verified ? 1 : 0,
          c.instagramUrl,
          c.bio
        )
      }
    }

    // Seed reels from showcase data
    const existingReels = db
      .query('SELECT COUNT(*) as count FROM reels')
      .get() as { count: number } | null

    if (!existingReels || existingReels.count === 0) {
      const insertReel = db.query(
        `INSERT INTO reels (reel_id, title, caption, hashtags, audio_track, category, category_slug, location, video_url, instagram_url, views, likes, comments)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )

      for (const r of goaReelsPool) {
        insertReel.run(
          r.id,
          r.title,
          r.caption,
          JSON.stringify(r.hashtags),
          r.audioTrack,
          r.category,
          r.categorySlug,
          r.location,
          r.videoUrl,
          r.instagramUrl,
          r.views,
          r.likes,
          r.comments
        )
      }
    }

    db.exec('COMMIT')
    console.log('Showcase data seeded successfully.')
  } catch (err) {
    db.exec('ROLLBACK')
    console.error('Seeding failed:', err)
    throw err
  } finally {
    closeDb()
  }
}

if (require.main === module) {
  seedShowcaseData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
