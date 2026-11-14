import bcrypt from 'bcrypt'
import { faker } from '@faker-js/faker'
import { query, closePool } from '../lib/db'

// Fix the seed for deterministic generation across runs
faker.seed(42)

interface LocationRow {
  location_id: number
  area_name: string
  taluka: string
}

interface CategoryRow {
  category_id: number
  category_name: string
}

export async function seedDatabase() {
  console.log('🌱 Starting database seed for GoaCreatorDB...')

  // 1. Clean data tables (reset identity counters, preserving reference data)
  console.log('🧹 Truncating existing transactional data...')
  await query(`
    TRUNCATE TABLE
      audit_log,
      reviews,
      shortlists,
      collaboration_requests,
      creator_metrics,
      social_accounts,
      creator_categories,
      creators,
      businesses,
      sessions,
      password_reset_tokens,
      users
    RESTART IDENTITY CASCADE;
  `)

  // 2. Fetch reference data
  const locationsRes = await query<LocationRow>('SELECT location_id, area_name, taluka FROM locations')
  const categoriesRes = await query<CategoryRow>('SELECT category_id, category_name FROM categories')
  const locations = locationsRes.rows
  const categories = categoriesRes.rows

  if (locations.length === 0 || categories.length === 0) {
    throw new Error('Reference data missing! Please run migrations first (bun run db:migrate).')
  }

  const findLocation = (areaName: string): number => {
    const loc = locations.find((l) => l.area_name.toLowerCase() === areaName.toLowerCase())
    return loc ? loc.location_id : locations[0].location_id
  }

  const findCategory = (categoryName: string): number => {
    const cat = categories.find((c) => c.category_name.toLowerCase().includes(categoryName.toLowerCase()))
    return cat ? cat.category_id : categories[0].category_id
  }

  // 3. Hash passwords (demo logins + ONE shared hash for bulk users)
  console.log('🔐 Computing bcrypt hashes (12 rounds)...')
  const [adminHash, businessHash, creatorHash, bulkHash] = await Promise.all([
    bcrypt.hash('admin123', 12),
    bcrypt.hash('business123', 12),
    bcrypt.hash('creator123', 12),
    bcrypt.hash('password123', 12),
  ])

  // 4. Create Admin Demo Account
  console.log('👤 Seeding Admin account...')
  const adminRes = await query<{ user_id: number }>(
    `INSERT INTO users (email, password_hash, role, is_verified)
     VALUES ($1, $2, 'admin', true) RETURNING user_id`,
    ['admin@goaconnect.in', adminHash]
  )
  const adminUserId = adminRes.rows[0].user_id

  // 5. Seed Hand-curated Businesses & Creators
  console.log('🏢 Seeding hand-curated and demo accounts...')

  // Demo Business: Café Palmeira
  const palmeiraLocId = findLocation('Calangute')
  const palmeiraUserRes = await query<{ user_id: number }>(
    `INSERT INTO users (email, password_hash, role, is_verified)
     VALUES ($1, $2, 'business', true) RETURNING user_id`,
    ['palmeira@goaconnect.in', businessHash]
  )
  const palmeiraUserId = palmeiraUserRes.rows[0].user_id

  const palmeiraBizRes = await query<{ business_id: number }>(
    `INSERT INTO businesses (
       user_id, location_id, business_name, industry, description,
       contact_phone, instagram_handle
     ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING business_id`,
    [
      palmeiraUserId,
      palmeiraLocId,
      'Café Palmeira',
      'Food & Beach Dining',
      'Authentic Portuguese-Goan bistro in Calangute with artisan sourdough & coffee.',
      '+91 98221 44556',
      '@cafepalmeiragoa',
    ]
  )
  const palmeiraBizId = palmeiraBizRes.rows[0].business_id

  // Demo Creator: Rahul Naik
  const rahulLocId = findLocation('Panjim')
  const rahulUserRes = await query<{ user_id: number }>(
    `INSERT INTO users (email, password_hash, role, is_verified)
     VALUES ($1, $2, 'creator', true) RETURNING user_id`,
    ['rahul@goaconnect.in', creatorHash]
  )
  const rahulUserId = rahulUserRes.rows[0].user_id

  const rahulCreatorRes = await query<{ creator_id: number }>(
    `INSERT INTO creators (
       user_id, location_id, full_name, bio, accepts_barter, min_paid_rate
     ) VALUES ($1, $2, $3, $4, true, 8500) RETURNING creator_id`,
    [
      rahulUserId,
      rahulLocId,
      'Rahul Naik',
      'Documenting Goan tavernas, Portuguese bakeries, and modern coastal culinary bars.',
    ]
  )
  const rahulCreatorId = rahulCreatorRes.rows[0].creator_id

  // Categories & Social for Rahul
  await query(
    `INSERT INTO creator_categories (creator_id, category_id, is_primary) VALUES ($1, $2, true)`,
    [rahulCreatorId, findCategory('Food')]
  )
  await query(
    `INSERT INTO creator_categories (creator_id, category_id, is_primary) VALUES ($1, $2, false)`,
    [rahulCreatorId, findCategory('Heritage')]
  )
  const rahulInstaRes = await query<{ account_id: number }>(
    `INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
     VALUES ($1, 'instagram', '@rahul.goanbites', 'https://instagram.com/rahul.goanbites')
     RETURNING account_id`,
    [rahulCreatorId]
  )
  const rahulYoutubeRes = await query<{ account_id: number }>(
    `INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
     VALUES ($1, 'youtube', '@RahulGoanBites', 'https://youtube.com/@RahulGoanBites')
     RETURNING account_id`,
    [rahulCreatorId]
  )

  // Curated Creators from frontend
  interface CuratedCreator {
    name: string
    email: string
    area: string
    bio: string
    minRate: number
    barter: boolean
    primaryCat: string
    secondaryCat?: string
    handle: string
    followers: number
    er: number
  }

  const curatedCreators: CuratedCreator[] = [
    {
      name: 'Sneha Fernandes',
      email: 'sneha@goaconnect.in',
      area: 'Assagao',
      bio: 'Highlighting private Portuguese estates, heritage villas, and luxury tropical interiors.',
      minRate: 14000,
      barter: false,
      primaryCat: 'Travel',
      secondaryCat: 'Fashion',
      handle: '@sneha_curates',
      followers: 120000,
      er: 7.8,
    },
    {
      name: "Rohan D'Souza",
      email: 'rohan@goaconnect.in',
      area: 'Morjim',
      bio: 'Surf instructor, coastal filmmaker, and backwater trail guide across North Goa.',
      minRate: 6000,
      barter: true,
      primaryCat: 'Wellness',
      secondaryCat: 'Travel',
      handle: '@wavesofgoa',
      followers: 62000,
      er: 8.1,
    },
    {
      name: 'Ananya Kamat',
      email: 'ananya@goaconnect.in',
      area: 'Panjim',
      bio: 'Curating resort fashion, bohemian aesthetics, and luxury brand pop-ups in Panaji.',
      minRate: 10000,
      barter: true,
      primaryCat: 'Fashion',
      secondaryCat: 'Nightlife',
      handle: '@panjimfashionista',
      followers: 94000,
      er: 5.9,
    },
    {
      name: 'Kabir Mehta',
      email: 'kabir@goaconnect.in',
      area: 'Siolim',
      bio: 'DGCA-certified drone cinema capturing luxury villas, clifftops, and river backwaters.',
      minRate: 12500,
      barter: false,
      primaryCat: 'Travel',
      handle: '@kabir.drone',
      followers: 110000,
      er: 8.5,
    },
    {
      name: 'Zoya Alvares',
      email: 'zoya@goaconnect.in',
      area: 'Vagator',
      bio: 'Electronic music DJ, sunset festival curator, and music culture storyteller in Goa.',
      minRate: 9000,
      barter: true,
      primaryCat: 'Nightlife',
      handle: '@zoya.sundowner',
      followers: 78000,
      er: 7.2,
    },
  ]

  // Track all creators and businesses for bulk generation & requests
  interface CreatorEntry {
    creatorId: number
    userId: number
    fullName: string
    minRate: number
    accounts: number[]
  }

  interface BusinessEntry {
    businessId: number
    userId: number
    businessName: string
  }

  const allCreators: CreatorEntry[] = [
    {
      creatorId: rahulCreatorId,
      userId: rahulUserId,
      fullName: 'Rahul Naik',
      minRate: 8500,
      accounts: [rahulInstaRes.rows[0].account_id, rahulYoutubeRes.rows[0].account_id],
    },
  ]

  const allBusinesses: BusinessEntry[] = [
    {
      businessId: palmeiraBizId,
      userId: palmeiraUserId,
      businessName: 'Café Palmeira',
    },
  ]

  for (const c of curatedCreators) {
    const locId = findLocation(c.area)
    const uRes = await query<{ user_id: number }>(
      `INSERT INTO users (email, password_hash, role, is_verified)
       VALUES ($1, $2, 'creator', true) RETURNING user_id`,
      [c.email, bulkHash]
    )
    const uId = uRes.rows[0].user_id

    const crRes = await query<{ creator_id: number }>(
      `INSERT INTO creators (user_id, location_id, full_name, bio, accepts_barter, min_paid_rate)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING creator_id`,
      [uId, locId, c.name, c.bio, c.barter, c.minRate]
    )
    const crId = crRes.rows[0].creator_id

    await query(
      `INSERT INTO creator_categories (creator_id, category_id, is_primary) VALUES ($1, $2, true)`,
      [crId, findCategory(c.primaryCat)]
    )
    if (c.secondaryCat) {
      await query(
        `INSERT INTO creator_categories (creator_id, category_id, is_primary) VALUES ($1, $2, false)`,
        [crId, findCategory(c.secondaryCat)]
      )
    }

    const saRes = await query<{ account_id: number }>(
      `INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
       VALUES ($1, 'instagram', $2, $3) RETURNING account_id`,
      [crId, c.handle, `https://instagram.com/${c.handle.replace('@', '')}`]
    )
    allCreators.push({
      creatorId: crId,
      userId: uId,
      fullName: c.name,
      minRate: c.minRate,
      accounts: [saRes.rows[0].account_id],
    })
  }

  // Curated Businesses from frontend
  const curatedBusinesses = [
    {
      name: 'Antares Restaurant & Beach Club',
      email: 'antares@goaconnect.in',
      area: 'Vagator',
      industry: 'Nightlife & Sunsets',
      desc: 'Perched atop Vagator clifftops offering Australian culinary flair and sunset sundowners.',
      phone: '+91 98221 11223',
      handle: '@antares_goa',
    },
    {
      name: 'Gunpowder Assagao',
      email: 'gunpowder@goaconnect.in',
      area: 'Assagao',
      industry: 'Food & Beach Dining',
      desc: 'Homestyle peninsular South Indian recipes served in a vibrant heritage villa in Assagao.',
      phone: '+91 98221 33445',
      handle: '@gunpowder_goa',
    },
    {
      name: 'Villa Alentejo Stays',
      email: 'alentejo@goaconnect.in',
      area: 'Anjuna',
      industry: 'Travel & Villas',
      desc: 'Ultra-luxury private pool estates and Portuguese restored mansions for discerning travelers.',
      phone: '+91 98221 55667',
      handle: '@villaalentejogoa',
    },
    {
      name: 'Babka Goa Deli',
      email: 'babka@goaconnect.in',
      area: 'Anjuna',
      industry: 'Food & Beach Dining',
      desc: 'European patisserie and artisanal sourdough bakery crafting fresh babkas and specialty brews.',
      phone: '+91 98221 77889',
      handle: '@babkagoa',
    },
  ]

  for (const b of curatedBusinesses) {
    const locId = findLocation(b.area)
    const uRes = await query<{ user_id: number }>(
      `INSERT INTO users (email, password_hash, role, is_verified)
       VALUES ($1, $2, 'business', true) RETURNING user_id`,
      [b.email, bulkHash]
    )
    const uId = uRes.rows[0].user_id

    const bRes = await query<{ business_id: number }>(
      `INSERT INTO businesses (
         user_id, location_id, business_name, industry, description,
         contact_phone, instagram_handle
       ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING business_id`,
      [uId, locId, b.name, b.industry, b.desc, b.phone, b.handle]
    )
    allBusinesses.push({
      businessId: bRes.rows[0].business_id,
      userId: uId,
      businessName: b.name,
    })
  }

  // 6. Bulk Generation: ~120 creators total (6 curated + 114 bulk), ~40 businesses total (5 curated + 35 bulk)
  console.log('👥 Generating 114 bulk creators and 35 bulk businesses...')

  // Bulk Businesses (35)
  const businessIndustries = [
    'Food & Beach Dining',
    'Travel & Villas',
    'Nightlife & Sunsets',
    'Resort Fashion',
    'Wellness & Surf',
    'Goan Heritage',
  ]

  for (let i = 1; i <= 35; i++) {
    const bizName = `${faker.company.name()} Goa`
    const email = `biz_${i}_${faker.internet.username().toLowerCase()}@example.com`
    const loc = faker.helpers.arrayElement(locations)
    const industry = faker.helpers.arrayElement(businessIndustries)

    const uRes = await query<{ user_id: number }>(
      `INSERT INTO users (email, password_hash, role, is_verified)
       VALUES ($1, $2, 'business', $3) RETURNING user_id`,
      [email, bulkHash, faker.datatype.boolean(0.85)]
    )
    const uId = uRes.rows[0].user_id

    const bRes = await query<{ business_id: number }>(
      `INSERT INTO businesses (
         user_id, location_id, business_name, industry, description,
         contact_phone, instagram_handle
       ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING business_id`,
      [
        uId,
        loc.location_id,
        bizName,
        industry,
        faker.company.catchPhrase(),
        `+91 9${faker.string.numeric(9)}`,
        `@${faker.helpers.slugify(bizName).toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
      ]
    )
    allBusinesses.push({
      businessId: bRes.rows[0].business_id,
      userId: uId,
      businessName: bizName,
    })
  }

  // Bulk Creators (114)
  for (let i = 1; i <= 114; i++) {
    const fullName = `${faker.person.firstName()} ${faker.person.lastName()}`
    const email = `creator_${i}_${faker.internet.username().toLowerCase()}@example.com`
    const loc = faker.helpers.arrayElement(locations)
    const minRate = faker.helpers.arrayElement([0, 3000, 5000, 7500, 10000, 15000, 20000, 25000])
    const acceptsBarter = faker.datatype.boolean(0.7)
    const isVerified = faker.datatype.boolean(0.65)

    const uRes = await query<{ user_id: number }>(
      `INSERT INTO users (email, password_hash, role, is_verified)
       VALUES ($1, $2, 'creator', $3) RETURNING user_id`,
      [email, bulkHash, isVerified]
    )
    const uId = uRes.rows[0].user_id

    const cRes = await query<{ creator_id: number }>(
      `INSERT INTO creators (
         user_id, location_id, full_name, bio, accepts_barter, min_paid_rate
       ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING creator_id`,
      [
        uId,
        loc.location_id,
        fullName,
        faker.person.bio(),
        acceptsBarter,
        minRate,
      ]
    )
    const crId = cRes.rows[0].creator_id

    // Primary category
    const cat1 = faker.helpers.arrayElement(categories)
    await query(
      `INSERT INTO creator_categories (creator_id, category_id, is_primary) VALUES ($1, $2, true)`,
      [crId, cat1.category_id]
    )

    // Optional secondary category
    if (faker.datatype.boolean(0.4)) {
      const remainingCats = categories.filter((c) => c.category_id !== cat1.category_id)
      const cat2 = faker.helpers.arrayElement(remainingCats)
      await query(
        `INSERT INTO creator_categories (creator_id, category_id, is_primary) VALUES ($1, $2, false)`,
        [crId, cat2.category_id]
      )
    }

    // Social accounts (Instagram guaranteed, YouTube 40% chance)
    const accounts: number[] = []
    const cleanHandle = `@${faker.helpers.slugify(fullName).toLowerCase().replace(/[^a-z0-9_]/g, '')}_${i}`
    const sa1Res = await query<{ account_id: number }>(
      `INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
       VALUES ($1, 'instagram', $2, $3) RETURNING account_id`,
      [crId, cleanHandle, `https://instagram.com/${cleanHandle.replace('@', '')}`]
    )
    accounts.push(sa1Res.rows[0].account_id)

    if (faker.datatype.boolean(0.4)) {
      const ytHandle = `@${faker.helpers.slugify(fullName).toLowerCase().replace(/[^a-z0-9_]/g, '')}_yt_${i}`
      const sa2Res = await query<{ account_id: number }>(
        `INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
         VALUES ($1, 'youtube', $2, $3) RETURNING account_id`,
        [crId, ytHandle, `https://youtube.com/${ytHandle}`]
      )
      accounts.push(sa2Res.rows[0].account_id)
    }

    allCreators.push({
      creatorId: crId,
      userId: uId,
      fullName,
      minRate,
      accounts,
    })
  }

  // 7. Creator Metrics: 3-6 monthly snapshots per social account
  console.log('📈 Seeding 3-6 months of metrics snapshots per social account...')
  const now = new Date()

  for (const cr of allCreators) {
    for (const accId of cr.accounts) {
      const snapshotCount = faker.number.int({ min: 3, max: 6 })
      let baseFollowers = faker.number.int({ min: 3000, max: 250000 })
      const isAdminVerified = faker.datatype.boolean(0.35)

      for (let s = snapshotCount; s >= 1; s--) {
        const monthsAgo = s - 1
        const recordedAt = new Date(
          now.getTime() - monthsAgo * 30 * 24 * 60 * 60 * 1000 - faker.number.int({ min: 1, max: 5 }) * 86400000
        )
        baseFollowers = Math.round(baseFollowers * (1 + faker.number.float({ min: 0.01, max: 0.06 })))

        const er = Math.round(faker.number.float({ min: 1.5, max: 12.5 }) * 10) / 10
        const goaPct = Math.round(faker.number.float({ min: 20.0, max: 80.0 }) * 10) / 10
        const avgLikes = Math.max(1, Math.round((baseFollowers * er) / 100))
        const avgComments = Math.max(1, Math.round(avgLikes * 0.08))
        const avgViews = Math.round(baseFollowers * faker.number.float({ min: 0.15, max: 0.9 }))

        const dataSource = isAdminVerified ? 'admin_verified' : 'self_reported'
        const verifiedBy = isAdminVerified ? adminUserId : null

        await query(
          `INSERT INTO creator_metrics (
             account_id, recorded_at, follower_count, avg_views, avg_likes,
             avg_comments, engagement_rate, audience_goa_pct, data_source, verified_by
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            accId,
            recordedAt.toISOString(),
            baseFollowers,
            avgViews,
            avgLikes,
            avgComments,
            er,
            goaPct,
            dataSource,
            verifiedBy,
          ]
        )
      }
    }
  }

  // 8. Collaboration Requests: ~400 requests spread over last 6 months
  console.log('🤝 Seeding ~400 collaboration requests and transitions...')
  const targetRequestCount = 400
  const usedPairs = new Set<string>()

  interface SeededRequest {
    requestId: number
    businessUserId: number
    creatorUserId: number
    status: string
  }
  const completedRequests: SeededRequest[] = []

  const deliverablesPool = [
    '1 Instagram Reel + 3 Stories showcasing weekend brunch menu',
    '2 High-production Reels highlighting private villa architecture and pool',
    '1 Sunset DJ teaser Reel + Instagram Story takeover',
    '3 Curated fashion Stories promoting boutique resort pop-up',
    '1 YouTube Shorts review + 1 Dedicated Reel for craft cocktails',
    '1 Heritage walking tour Reel with Goan poee tasting',
  ]

  for (let r = 0; r < targetRequestCount; r++) {
    let biz = faker.helpers.arrayElement(allBusinesses)
    let creator = faker.helpers.arrayElement(allCreators)
    let pairKey = `${biz.businessId}-${creator.creatorId}`

    // Ensure distinct (business, creator) pair per request to never violate uq_requests_pending_pair
    let attempts = 0
    while (usedPairs.has(pairKey) && attempts < 50) {
      biz = faker.helpers.arrayElement(allBusinesses)
      creator = faker.helpers.arrayElement(allCreators)
      pairKey = `${biz.businessId}-${creator.creatorId}`
      attempts++
    }
    usedPairs.add(pairKey)

    // Status distribution: ~30% completed, ~25% accepted, ~20% pending, ~15% rejected, ~10% cancelled
    let targetStatus: 'pending' | 'accepted' | 'completed' | 'rejected' | 'cancelled'
    const statusRoll = faker.number.float({ min: 0, max: 100 })
    if (statusRoll < 30) {
      targetStatus = 'completed'
    } else if (statusRoll < 55) {
      targetStatus = 'accepted'
    } else if (statusRoll < 75) {
      targetStatus = 'pending'
    } else if (statusRoll < 90) {
      targetStatus = 'rejected'
    } else {
      targetStatus = 'cancelled'
    }

    // Collab type & amount
    const collabType = faker.helpers.arrayElement(['paid', 'paid', 'barter', 'hybrid']) as 'paid' | 'barter' | 'hybrid'
    const offeredAmount =
      collabType === 'barter'
        ? 0
        : Math.max(creator.minRate || 5000, faker.number.int({ min: 5000, max: 40000 }))

    // Timing
    const daysAgo = faker.number.int({ min: 5, max: 180 })
    const requestedAt = new Date(now.getTime() - daysAgo * 86400000)
    // Trigger constraint: deadline MUST be > CURRENT_DATE at INSERT time
    const futureDeadline = new Date(now.getTime() + faker.number.int({ min: 10, max: 60 }) * 86400000)
    const deliverables = faker.helpers.arrayElement(deliverablesPool)

    // Step 1: Insert strictly as 'pending' to satisfy fn_collab_request_guard trigger
    const reqRes = await query<{ request_id: number }>(
      `INSERT INTO collaboration_requests (
         business_id, creator_id, collab_type, offered_amount, deliverables,
         deadline, status, requested_at
       ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7) RETURNING request_id`,
      [
        biz.businessId,
        creator.creatorId,
        collabType,
        offeredAmount,
        deliverables,
        futureDeadline.toISOString().split('T')[0],
        requestedAt.toISOString(),
      ]
    )
    const reqId = reqRes.rows[0].request_id

    // Step 2: Transition through state machine triggers
    const respondedAt = new Date(requestedAt.getTime() + faker.number.int({ min: 1, max: 3 }) * 86400000)

    if (targetStatus === 'rejected') {
      await query(
        `UPDATE collaboration_requests SET status = 'rejected', responded_at = $1 WHERE request_id = $2`,
        [respondedAt.toISOString(), reqId]
      )
    } else if (targetStatus === 'cancelled') {
      await query(
        `UPDATE collaboration_requests SET status = 'cancelled' WHERE request_id = $1`,
        [reqId]
      )
    } else if (targetStatus === 'accepted') {
      await query(
        `UPDATE collaboration_requests SET status = 'accepted', responded_at = $1 WHERE request_id = $2`,
        [respondedAt.toISOString(), reqId]
      )
    } else if (targetStatus === 'completed') {
      // Transition pending -> accepted -> completed
      await query(
        `UPDATE collaboration_requests SET status = 'accepted', responded_at = $1 WHERE request_id = $2`,
        [respondedAt.toISOString(), reqId]
      )
      await query(
        `UPDATE collaboration_requests SET status = 'completed' WHERE request_id = $1`,
        [reqId]
      )
      completedRequests.push({
        requestId: reqId,
        businessUserId: biz.userId,
        creatorUserId: creator.userId,
        status: 'completed',
      })
    }
  }

  // 9. Reviews: Insert ONLY on completed requests between matching business and creator
  console.log(`⭐ Seeding reviews on ${completedRequests.length} completed requests...`)
  const reviewCommentsBiz = [
    'Exceptional content quality! Drove massive footfall to our weekend event.',
    'Very professional, delivered ahead of schedule and the aesthetic was on point.',
    'Great engagement from local Goan audience. Will definitely collaborate again!',
    'Authentic storytelling that represented our heritage beautifully.',
    'Flawless communication and high-converting Reels. Highly recommended.',
  ]

  const reviewCommentsCreator = [
    'Wonderful experience working with the team. Very hospitable and clear brief.',
    'Loved shooting at the venue! Smooth collaboration from start to finish.',
    'Prompt coordination and great creative freedom given.',
    'Fantastic brand to work with in Goa. Looking forward to future projects!',
  ]

  for (const req of completedRequests) {
    // Business reviews Creator (70% probability)
    if (faker.datatype.boolean(0.7)) {
      const rating = faker.helpers.arrayElement([4, 5, 5, 5, 4, 3])
      const comment = faker.helpers.arrayElement(reviewCommentsBiz)
      await query(
        `INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.requestId, req.businessUserId, req.creatorUserId, rating, comment]
      )
    }

    // Creator reviews Business (50% probability)
    if (faker.datatype.boolean(0.5)) {
      const rating = faker.helpers.arrayElement([4, 5, 5, 4])
      const comment = faker.helpers.arrayElement(reviewCommentsCreator)
      await query(
        `INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.requestId, req.creatorUserId, req.businessUserId, rating, comment]
      )
    }
  }

  // 10. Shortlists: Businesses shortlisting creators
  console.log('📌 Seeding business shortlists...')
  const shortlistCount = 150
  for (let s = 0; s < shortlistCount; s++) {
    const biz = faker.helpers.arrayElement(allBusinesses)
    const creator = faker.helpers.arrayElement(allCreators)
    await query(
      `INSERT INTO shortlists (business_id, creator_id)
       VALUES ($1, $2)
       ON CONFLICT (business_id, creator_id) DO NOTHING`,
      [biz.businessId, creator.creatorId]
    )
  }

  // 11. Print row count for every table when finished
  console.log('\n📊 Seeding complete! Verification Table Counts:')
  console.log('====================================================')
  const tables = [
    'users',
    'businesses',
    'creators',
    'creator_categories',
    'social_accounts',
    'creator_metrics',
    'collaboration_requests',
    'reviews',
    'shortlists',
    'locations',
    'categories',
    'sessions',
    'password_reset_tokens',
    'audit_log',
  ]

  for (const table of tables) {
    const countRes = await query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM ${table}`)
    console.log(`  - ${table.padEnd(25)} : ${countRes.rows[0].count} rows`)
  }
  console.log('====================================================\n')
}

// CLI entry point
if (import.meta.main || (typeof require !== 'undefined' && require.main === module)) {
  seedDatabase()
    .then(async () => {
      console.log('✅ Database seeded successfully!')
      await closePool()
      process.exit(0)
    })
    .catch(async (err) => {
      console.error('❌ Seeding failed with error:', err)
      await closePool()
      process.exit(1)
    })
}
