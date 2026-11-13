import { initDb, closeDb } from '@/lib/db'
import { goaCreators, goaReelsPool } from '@/lib/showcase-data'

export async function seedShowcaseData() {
  const db = await initDb()

  try {
    db.exec('BEGIN TRANSACTION')

    // Check if data already exists
    const existing = db
      .query('SELECT COUNT(*) as count FROM creator_profiles')
      .get() as { count: number } | null

    if (existing && existing.count > 0) {
      console.log('Showcase data already seeded. Skipping.')
      db.exec('COMMIT')
      closeDb()
      return
    }

    // Insert creator profiles
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

    // Insert reels
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