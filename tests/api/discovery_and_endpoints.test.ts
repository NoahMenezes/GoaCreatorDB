import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { query, closePool } from '@/lib/db'
import { loginUser, registerUser, setTestSessionToken, clearAllRateLimits } from '@/lib/auth'

// Route Handlers
import { GET as getCategoriesHandler } from '@/app/api/categories/route'
import { GET as getLocationsHandler } from '@/app/api/locations/route'
import { GET as getPublicStatsHandler } from '@/app/api/stats/public/route'
import { GET as getCreatorsHandler } from '@/app/api/creators/route'
import { GET as getFeaturedCreatorsHandler } from '@/app/api/creators/featured/route'
import { GET as getCreatorByIdHandler } from '@/app/api/creators/[id]/route'
import { GET as getProfileHandler, PUT as putProfileHandler } from '@/app/api/profile/route'
import {
  GET as getSocialAccountsHandler,
  POST as postSocialAccountsHandler,
  DELETE as deleteSocialAccountsHandler,
} from '@/app/api/social/accounts/route'
import { POST as postSocialSyncHandler } from '@/app/api/social/sync/route'
import { GET as getDashboardStatsHandler } from '@/app/api/dashboard/stats/route'
import { GET as getRequestHandler } from '@/app/api/requests/[id]/route'

describe('Discovery, Views, Privacy & Ownership API Suite', () => {
  let demoBizToken: string
  let demoCreatorToken: string
  let secondCreatorToken: string
  let secondCreatorUserId: number
  let secondCreatorId: number
  let secondCreatorAccountId: number

  let testBizId: number
  let testCreatorId: number
  let testValidLocationId: number
  let testPendingRequestId: number
  let testAcceptedRequestId: number

  beforeAll(async () => {
    // 0. Ensure clean state
    await query(`
      DELETE FROM reviews WHERE request_id IN (
        SELECT request_id FROM collaboration_requests WHERE creator_id IN (
          SELECT creator_id FROM creators WHERE user_id IN (
            SELECT user_id FROM users WHERE email = 'second_creator@discoverytest.com'
          )
        )
      );
      DELETE FROM collaboration_requests WHERE creator_id IN (
        SELECT creator_id FROM creators WHERE user_id IN (
          SELECT user_id FROM users WHERE email = 'second_creator@discoverytest.com'
        )
      );
      DELETE FROM creator_metrics WHERE account_id IN (
        SELECT account_id FROM social_accounts WHERE creator_id IN (
          SELECT creator_id FROM creators WHERE user_id IN (
            SELECT user_id FROM users WHERE email = 'second_creator@discoverytest.com'
          )
        )
      );
      DELETE FROM social_accounts WHERE creator_id IN (
        SELECT creator_id FROM creators WHERE user_id IN (
          SELECT user_id FROM users WHERE email = 'second_creator@discoverytest.com'
        )
      );
      DELETE FROM creator_categories WHERE creator_id IN (
        SELECT creator_id FROM creators WHERE user_id IN (
          SELECT user_id FROM users WHERE email = 'second_creator@discoverytest.com'
        )
      );
      DELETE FROM sessions WHERE user_id IN (SELECT user_id FROM users WHERE email = 'second_creator@discoverytest.com');
      DELETE FROM creators WHERE user_id IN (SELECT user_id FROM users WHERE email = 'second_creator@discoverytest.com');
      DELETE FROM users WHERE email = 'second_creator@discoverytest.com';
    `)

    // 1. Fetch valid reference IDs
    const locRes = await query<{ location_id: number }>('SELECT location_id FROM locations LIMIT 1')
    testValidLocationId = locRes.rows[0].location_id

    // 2. Login demo business and demo creator
    const bizLogin = await loginUser('palmeira@goaconnect.in', 'business123')
    demoBizToken = bizLogin.token
    testBizId = (bizLogin.profile as { business_id: number }).business_id

    const creatorLogin = await loginUser('rahul@goaconnect.in', 'creator123')
    demoCreatorToken = creatorLogin.token
    testCreatorId = (creatorLogin.profile as { creator_id: number }).creator_id

    // 3. Register a second creator for ownership & isolation checks
    const regRes = await registerUser({
      email: 'second_creator@discoverytest.com',
      password: 'password123',
      role: 'creator',
      location_id: testValidLocationId,
      creatorData: {
        full_name: 'Second Creator For Test',
        bio: 'Second creator test bio',
        min_paid_rate: 3000,
      },
    })
    secondCreatorToken = regRes.token
    secondCreatorUserId = regRes.user.user_id
    secondCreatorId = (regRes.profile as { creator_id: number }).creator_id

    // Create a social account for second creator
    const saRes = await query<{ account_id: number }>(
      `INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
       VALUES ($1, 'instagram', '@second_creator_handle', 'https://instagram.com/second_creator_handle')
       RETURNING account_id`,
      [secondCreatorId]
    )
    secondCreatorAccountId = saRes.rows[0].account_id

    // 4. Create collaboration requests for privacy testing (one pending, one accepted)
    // Pending request:
    const req1 = await query<{ request_id: number }>(
      `INSERT INTO collaboration_requests (
         business_id, creator_id, collab_type, offered_amount, deliverables, deadline, status
       ) VALUES ($1, $2, 'paid', 8000, '1 Reel + 1 Story', CURRENT_DATE + INTERVAL '10 days', 'pending')
       RETURNING request_id`,
      [testBizId, secondCreatorId]
    )
    testPendingRequestId = req1.rows[0].request_id

    // Accepted request (must insert as pending, then update to accepted to satisfy trigger guard)
    const req2 = await query<{ request_id: number }>(
      `INSERT INTO collaboration_requests (
         business_id, creator_id, collab_type, offered_amount, deliverables, deadline, status
       ) VALUES ($1, $2, 'paid', 12000, '2 Feed Posts', CURRENT_DATE + INTERVAL '14 days', 'pending')
       RETURNING request_id`,
      [testBizId, testCreatorId]
    )
    testAcceptedRequestId = req2.rows[0].request_id
    await query(
      `UPDATE collaboration_requests
       SET status = 'accepted', responded_at = NOW()
       WHERE request_id = $1`,
      [testAcceptedRequestId]
    )
  })

  afterAll(async () => {
    setTestSessionToken(null)
    // Clean up test data created in this suite
    const reqIds = [testPendingRequestId, testAcceptedRequestId].filter(Boolean)
    if (reqIds.length > 0) {
      await query('DELETE FROM reviews WHERE request_id = ANY($1)', [reqIds])
      await query('DELETE FROM collaboration_requests WHERE request_id = ANY($1)', [reqIds])
    }
    if (secondCreatorAccountId) {
      await query('DELETE FROM creator_metrics WHERE account_id = $1', [secondCreatorAccountId])
      await query('DELETE FROM social_accounts WHERE account_id = $1', [secondCreatorAccountId])
    }
    if (secondCreatorId) {
      await query('DELETE FROM creator_categories WHERE creator_id = $1', [secondCreatorId])
    }
    if (secondCreatorUserId) {
      await query('DELETE FROM sessions WHERE user_id = $1', [secondCreatorUserId])
      await query('DELETE FROM creators WHERE user_id = $1', [secondCreatorUserId])
      await query('DELETE FROM users WHERE user_id = $1', [secondCreatorUserId])
    }
    clearAllRateLimits()
    await closePool()
  })

  // ===========================================================================
  // 1. PUBLIC ENDPOINTS
  // ===========================================================================
  describe('Public Endpoints', () => {
    it('GET /api/categories: should return categories with distribution stats', async () => {
      const res = await getCategoriesHandler()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.data.length).toBeGreaterThan(0)

      const first = body.data[0]
      expect(first).toHaveProperty('category_id')
      expect(first).toHaveProperty('category_name')
      expect(first).toHaveProperty('creator_count')
      expect(first).toHaveProperty('primary_creator_count')
      expect(first).toHaveProperty('pct_of_creators')
    })

    it('GET /api/locations: should return locations grouped by district then taluka', async () => {
      const res = await getLocationsHandler()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(typeof body.data).toBe('object')

      // Must have North Goa and South Goa
      expect(body.data).toHaveProperty('North Goa')
      expect(body.data).toHaveProperty('South Goa')

      // Must have talukas inside North Goa (e.g., Bardez, Tiswadi)
      const northGoa = body.data['North Goa']
      expect(northGoa).toHaveProperty('Bardez')
      expect(Array.isArray(northGoa['Bardez'])).toBe(true)
      expect(northGoa['Bardez'].length).toBeGreaterThan(0)
      expect(northGoa['Bardez'][0]).toHaveProperty('location_id')
      expect(northGoa['Bardez'][0]).toHaveProperty('area_name')
    })

    it('GET /api/stats/public: should return real platform KPIs for landing page', async () => {
      const res = await getPublicStatsHandler()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.creators).toBeGreaterThan(0)
      expect(body.data.businesses).toBeGreaterThan(0)
      expect(body.data.completed_collaborations).toBeGreaterThanOrEqual(0)
      expect(body.data).toHaveProperty('total_completed_deal_volume')
      expect(body.data).toHaveProperty('platform_avg_rating')
    })

    it('GET /api/creators/featured: should return top verified creators', async () => {
      const res = await getFeaturedCreatorsHandler()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.data.length).toBeGreaterThan(0)
      expect(body.data.length).toBeLessThanOrEqual(6)

      for (const creator of body.data) {
        expect(creator.verified).toBe(true)
        expect(creator.is_verified).toBe(true)
        expect(creator).not.toHaveProperty('password_hash')
        expect(creator).not.toHaveProperty('email')
      }
    })

    it('GET /api/creators/[id]: should return complete creator profile and metrics', async () => {
      const req = new Request(`http://localhost:3000/api/creators/${testCreatorId}`)
      const res = await getCreatorByIdHandler(req, { params: Promise.resolve({ id: String(testCreatorId) }) })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('profile')
      expect(body.data.profile.creator_id).toBe(testCreatorId)
      expect(body.data).toHaveProperty('categories')
      expect(body.data).toHaveProperty('social_accounts')
      expect(body.data).toHaveProperty('metric_history')
      expect(body.data).toHaveProperty('reviews')
      expect(body.data).toHaveProperty('average_rating')

      // Ensure privacy: no password or email leaked
      expect(body.data.profile).not.toHaveProperty('password_hash')
      expect(body.data.profile).not.toHaveProperty('email')
    })

    it('GET /api/creators/[id]: should return 404 for non-existent ID and 400 for invalid ID', async () => {
      const req404 = new Request('http://localhost:3000/api/creators/999999')
      const res404 = await getCreatorByIdHandler(req404, { params: Promise.resolve({ id: '999999' }) })
      expect(res404.status).toBe(404)

      const req400 = new Request('http://localhost:3000/api/creators/invalid')
      const res400 = await getCreatorByIdHandler(req400, { params: Promise.resolve({ id: 'invalid' }) })
      expect(res400.status).toBe(400)
    })
  })

  // ===========================================================================
  // 2. DISCOVERY FILTERS SUITE (/api/creators)
  // ===========================================================================
  describe('Creator Discovery Filters (/api/creators)', () => {
    it('1. Default filter: returns page 1 with 12 creators and pagination metadata', async () => {
      const req = new Request('http://localhost:3000/api/creators')
      const res = await getCreatorsHandler(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.length).toBeLessThanOrEqual(12)
      expect(body.pagination.page).toBe(1)
      expect(body.pagination.limit).toBe(12)
      expect(body.pagination.total).toBeGreaterThan(0)
      expect(body.pagination.totalPages).toBeGreaterThanOrEqual(1)
      expect(body.pagination.hasPrev).toBe(false)
      expect(body.pagination).toHaveProperty('hasNext')

      // Verify no sensitive columns leaked
      for (const creator of body.data) {
        expect(creator).not.toHaveProperty('password_hash')
        expect(creator).not.toHaveProperty('email')
      }
    })

    it('2. Trigram search: searches by creator full name (q="Rahul")', async () => {
      const req = new Request('http://localhost:3000/api/creators?q=Rahul')
      const res = await getCreatorsHandler(req)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.length).toBeGreaterThan(0)
      const match = body.data.some(
        (c: { full_name: string; handle: string }) =>
          c.full_name.toLowerCase().includes('rahul') || c.handle.toLowerCase().includes('rahul')
      )
      expect(match).toBe(true)
    })

    it('3. Trigram search: searches by social handle (q="rahul_demo")', async () => {
      const req = new Request('http://localhost:3000/api/creators?q=rahul_demo')
      const res = await getCreatorsHandler(req)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.length).toBeGreaterThan(0)
      const match = body.data.some(
        (c: { full_name: string; handle: string }) =>
          c.handle.toLowerCase().includes('rahul_demo') || c.full_name.toLowerCase().includes('rahul')
      )
      expect(match).toBe(true)
    })

    it('4. Category filter: single category by name', async () => {
      const req = new Request('http://localhost:3000/api/creators?category=Food%20%26%20Dining')
      const res = await getCreatorsHandler(req)
      const body = await res.json()
      expect(body.success).toBe(true)
      for (const c of body.data) {
        const catNames = (c.categories as { category_name: string }[]).map((cat) => cat.category_name)
        expect(catNames).toContain('Food & Dining')
      }
    })

    it('5. Category filter: multiple categories (comma-separated or repeated params)', async () => {
      const req = new Request('http://localhost:3000/api/creators?category=Food%20%26%20Dining,Travel%20%26%20Tourism')
      const res = await getCreatorsHandler(req)
      const body = await res.json()
      expect(body.success).toBe(true)
      for (const c of body.data) {
        const catNames = (c.categories as { category_name: string }[]).map((cat) => cat.category_name)
        const hasMatch = catNames.includes('Food & Dining') || catNames.includes('Travel & Tourism')
        expect(hasMatch).toBe(true)
      }
    })

    it('6. District filter: North Goa vs South Goa', async () => {
      const reqNorth = new Request('http://localhost:3000/api/creators?district=North%20Goa')
      const resNorth = await getCreatorsHandler(reqNorth)
      const bodyNorth = await resNorth.json()
      expect(bodyNorth.success).toBe(true)
      for (const c of bodyNorth.data) {
        expect(c.district).toBe('North Goa')
      }

      const reqSouth = new Request('http://localhost:3000/api/creators?district=South%20Goa')
      const resSouth = await getCreatorsHandler(reqSouth)
      const bodySouth = await resSouth.json()
      expect(bodySouth.success).toBe(true)
      for (const c of bodySouth.data) {
        expect(c.district).toBe('South Goa')
      }
    })

    it('7. Taluka filter: single and multiple talukas', async () => {
      const reqSingle = new Request('http://localhost:3000/api/creators?taluka=Bardez')
      const resSingle = await getCreatorsHandler(reqSingle)
      const bodySingle = await resSingle.json()
      expect(bodySingle.success).toBe(true)
      for (const c of bodySingle.data) {
        expect(c.taluka).toBe('Bardez')
      }

      const reqMulti = new Request('http://localhost:3000/api/creators?taluka=Bardez&taluka=Tiswadi')
      const resMulti = await getCreatorsHandler(reqMulti)
      const bodyMulti = await resMulti.json()
      expect(bodyMulti.success).toBe(true)
      for (const c of bodyMulti.data) {
        expect(['Bardez', 'Tiswadi']).toContain(c.taluka)
      }
    })

    it('8. Follower range filter: minFollowers and maxFollowers', async () => {
      const req = new Request('http://localhost:3000/api/creators?minFollowers=5000&maxFollowers=100000')
      const res = await getCreatorsHandler(req)
      const body = await res.json()
      expect(body.success).toBe(true)
      for (const c of body.data) {
        expect(c.total_followers).toBeGreaterThanOrEqual(5000)
        expect(c.total_followers).toBeLessThanOrEqual(100000)
      }
    })

    it('9. Engagement rate filter: minEngagement', async () => {
      const req = new Request('http://localhost:3000/api/creators?minEngagement=2.5')
      const res = await getCreatorsHandler(req)
      const body = await res.json()
      expect(body.success).toBe(true)
      for (const c of body.data) {
        expect(c.avg_engagement_rate).toBeGreaterThanOrEqual(2.5)
      }
    })

    it('10. Collab type filter: paid, barter, and hybrid', async () => {
      // paid: min_paid_rate > 0
      const reqPaid = new Request('http://localhost:3000/api/creators?collabType=paid')
      const resPaid = await getCreatorsHandler(reqPaid)
      const bodyPaid = await resPaid.json()
      expect(bodyPaid.success).toBe(true)
      for (const c of bodyPaid.data) {
        expect(c.min_paid_rate).toBeGreaterThan(0)
      }

      // barter: accepts_barter = true
      const reqBarter = new Request('http://localhost:3000/api/creators?collabType=barter')
      const resBarter = await getCreatorsHandler(reqBarter)
      const bodyBarter = await resBarter.json()
      expect(bodyBarter.success).toBe(true)
      for (const c of bodyBarter.data) {
        expect(c.accepts_barter).toBe(true)
      }

      // hybrid: accepts_barter = true AND min_paid_rate > 0
      const reqHybrid = new Request('http://localhost:3000/api/creators?collabType=hybrid')
      const resHybrid = await getCreatorsHandler(reqHybrid)
      const bodyHybrid = await resHybrid.json()
      expect(bodyHybrid.success).toBe(true)
      for (const c of bodyHybrid.data) {
        expect(c.accepts_barter).toBe(true)
        expect(c.min_paid_rate).toBeGreaterThan(0)
      }
    })

    it('11. Max rate filter: maxRate', async () => {
      const req = new Request('http://localhost:3000/api/creators?maxRate=15000')
      const res = await getCreatorsHandler(req)
      const body = await res.json()
      expect(body.success).toBe(true)
      for (const c of body.data) {
        expect(c.min_paid_rate).toBeLessThanOrEqual(15000)
      }
    })

    it('12. Verified only filter: verifiedOnly=true', async () => {
      const req = new Request('http://localhost:3000/api/creators?verifiedOnly=true')
      const res = await getCreatorsHandler(req)
      const body = await res.json()
      expect(body.success).toBe(true)
      for (const c of body.data) {
        expect(c.is_verified).toBe(true)
      }
    })

    it('13. Sorting: followers, engagement, rating, recent', async () => {
      // sort by followers desc
      const resFollowers = await getCreatorsHandler(new Request('http://localhost:3000/api/creators?sort=followers&limit=10'))
      const bodyFollowers = await resFollowers.json()
      for (let i = 0; i < bodyFollowers.data.length - 1; i++) {
        expect(bodyFollowers.data[i].total_followers).toBeGreaterThanOrEqual(bodyFollowers.data[i + 1].total_followers)
      }

      // sort by engagement desc
      const resEngagement = await getCreatorsHandler(new Request('http://localhost:3000/api/creators?sort=engagement&limit=10'))
      const bodyEngagement = await resEngagement.json()
      for (let i = 0; i < bodyEngagement.data.length - 1; i++) {
        expect(bodyEngagement.data[i].avg_engagement_rate).toBeGreaterThanOrEqual(bodyEngagement.data[i + 1].avg_engagement_rate)
      }

      // sort by rating desc
      const resRating = await getCreatorsHandler(new Request('http://localhost:3000/api/creators?sort=rating&limit=10'))
      const bodyRating = await resRating.json()
      for (let i = 0; i < bodyRating.data.length - 1; i++) {
        expect(bodyRating.data[i].avg_rating).toBeGreaterThanOrEqual(bodyRating.data[i + 1].avg_rating)
      }

      // sort by recent desc
      const resRecent = await getCreatorsHandler(new Request('http://localhost:3000/api/creators?sort=recent&limit=10'))
      const bodyRecent = await resRecent.json()
      for (let i = 0; i < bodyRecent.data.length - 1; i++) {
        const t1 = new Date(bodyRecent.data[i].created_at).getTime()
        const t2 = new Date(bodyRecent.data[i + 1].created_at).getTime()
        expect(t1).toBeGreaterThanOrEqual(t2)
      }
    })

    it('14. Pagination: page 2 with custom limit', async () => {
      const req = new Request('http://localhost:3000/api/creators?page=2&limit=5')
      const res = await getCreatorsHandler(req)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.length).toBeLessThanOrEqual(5)
      expect(body.pagination.page).toBe(2)
      expect(body.pagination.limit).toBe(5)
      expect(body.pagination.hasPrev).toBe(true)
    })
  })

  // ===========================================================================
  // 3. OWNERSHIP CHECKS & SOCIAL ACCOUNTS SUITE
  // ===========================================================================
  describe('Ownership & Social Accounts Suite', () => {
    it('Creator should be able to view their own connected social accounts', async () => {
      setTestSessionToken(demoCreatorToken)
      const res = await getSocialAccountsHandler()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
    })

    it('Non-creator (business) should be rejected from connecting social accounts (403)', async () => {
      setTestSessionToken(demoBizToken)
      const req = new Request('http://localhost:3000/api/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'instagram',
          handle: '@biz_instagram',
        }),
      })
      const res = await postSocialAccountsHandler(req)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toContain('Only creators can connect social accounts')
    })

    it('Ownership check: Creator A cannot delete Creator B social account (403)', async () => {
      // Authenticate as Rahul (demo creator)
      setTestSessionToken(demoCreatorToken)

      // Try to delete second creator's social account
      const req = new Request(`http://localhost:3000/api/social/accounts?id=${secondCreatorAccountId}`, {
        method: 'DELETE',
      })
      const res = await deleteSocialAccountsHandler(req)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toContain('You do not own this social account')

      // Ensure the account was NOT deleted
      const checkRes = await query('SELECT account_id FROM social_accounts WHERE account_id = $1', [secondCreatorAccountId])
      expect(checkRes.rows.length).toBe(1)
    })

    it('Ownership check: Creator A cannot sync metrics on Creator B social account (403)', async () => {
      // Authenticate as Rahul (demo creator)
      setTestSessionToken(demoCreatorToken)

      // Try to sync metrics for second creator's social account
      const req = new Request('http://localhost:3000/api/social/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: secondCreatorAccountId,
          follower_count: 50000,
          engagement_rate: 4.5,
        }),
      })
      const res = await postSocialSyncHandler(req)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toContain('You do not own this social account')
    })

    it('Owner CAN sync metrics on their own social account as self_reported', async () => {
      // Authenticate as second creator (owner)
      setTestSessionToken(secondCreatorToken)

      const req = new Request('http://localhost:3000/api/social/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: secondCreatorAccountId,
          follower_count: 25000,
          engagement_rate: 3.8,
          recorded_at: '2026-11-14T10:00:00Z',
        }),
      })
      const res = await postSocialSyncHandler(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.data_source).toBe('self_reported')
      expect(body.data.verified_by).toBeNull()
      expect(Number(body.data.follower_count)).toBe(25000)
    })
  })

  // ===========================================================================
  // 4. PROFILE MANAGEMENT & CATEGORY TRANSACTIONS
  // ===========================================================================
  describe('Profile Management (/api/profile)', () => {
    it('Creator profile GET should return completeness and categories', async () => {
      setTestSessionToken(demoCreatorToken)
      const res = await getProfileHandler()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.completeness).toBeGreaterThan(0)
      expect(Array.isArray(body.data.categories)).toBe(true)
    })

    it('Creator profile PUT should reject non-existent location_id with 422', async () => {
      setTestSessionToken(demoCreatorToken)
      const req = new Request('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: 999999, // non-existent
        }),
      })
      const res = await putProfileHandler(req)
      expect(res.status).toBe(422)
      const body = await res.json()
      expect(body.error).toContain('Location not found')
    })

    it('Creator profile PUT should replace categories in one transaction with exactly one primary', async () => {
      setTestSessionToken(secondCreatorToken)

      // Fetch two category IDs
      const catRes = await query<{ category_id: number }>('SELECT category_id FROM categories ORDER BY category_id LIMIT 2')
      const cat1 = catRes.rows[0].category_id
      const cat2 = catRes.rows[1].category_id

      const req = new Request('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: 'Updated bio via test suite',
          categories: [
            { category_id: cat1, is_primary: true },
            { category_id: cat2, is_primary: true }, // Both set to primary -> code must ensure exactly one is primary!
          ],
        }),
      })
      const res = await putProfileHandler(req)
      expect(res.status).toBe(200)

      // Query database directly to verify partial unique constraint & primary count
      const checkRes = await query<{ category_id: number; is_primary: boolean }>(
        'SELECT category_id, is_primary FROM creator_categories WHERE creator_id = $1',
        [secondCreatorId]
      )
      expect(checkRes.rows.length).toBe(2)
      const primaryRows = checkRes.rows.filter((r) => r.is_primary)
      expect(primaryRows.length).toBe(1)
    })
  })

  // ===========================================================================
  // 5. PRIVACY RULES: CONTACT PHONE & EMAIL LEAKAGE
  // ===========================================================================
  describe('Privacy Rules Enforcement', () => {
    it('Business contact_phone is HIDDEN (null) to creator when request is pending', async () => {
      // Authenticate as second creator (recipient of pending request)
      setTestSessionToken(secondCreatorToken)

      const req = new Request(`http://localhost:3000/api/requests/${testPendingRequestId}`)
      const res = await getRequestHandler(req, { params: Promise.resolve({ id: String(testPendingRequestId) }) })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)

      // Must be null while pending
      expect(body.data.contact_phone).toBeNull()

      // Business email must not be leaked to creator
      expect(body.data).not.toHaveProperty('business_email')
      expect(body.data).not.toHaveProperty('password_hash')
    })

    it('Business contact_phone is REVEALED to creator when request is accepted', async () => {
      // Authenticate as Rahul (recipient of accepted request)
      setTestSessionToken(demoCreatorToken)

      const req = new Request(`http://localhost:3000/api/requests/${testAcceptedRequestId}`)
      const res = await getRequestHandler(req, { params: Promise.resolve({ id: String(testAcceptedRequestId) }) })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)

      // Must be revealed once accepted
      expect(body.data.contact_phone).not.toBeNull()
      expect(typeof body.data.contact_phone).toBe('string')
    })

    it('Third-party user cannot view collaboration request (404 Not Found)', async () => {
      // Authenticate as second creator, who is NOT a party to testAcceptedRequestId (between Cafe Palmeira and Rahul)
      setTestSessionToken(secondCreatorToken)

      const req = new Request(`http://localhost:3000/api/requests/${testAcceptedRequestId}`)
      const res = await getRequestHandler(req, { params: Promise.resolve({ id: String(testAcceptedRequestId) }) })
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toContain('Request not found')
    })
  })

  // ===========================================================================
  // 6. DASHBOARD STATS SUITE
  // ===========================================================================
  describe('Dashboard Stats (/api/dashboard/stats)', () => {
    it('Business stats return real non-zero metrics (fixes old 0 bug)', async () => {
      setTestSessionToken(demoBizToken)
      const res = await getDashboardStatsHandler()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)

      // Verified non-zero counts for seeded business Cafe Palmeira
      expect(body.data.active_requests).toBeGreaterThanOrEqual(0)
      expect(body.data.accepted).toBeGreaterThan(0)
      expect(body.data.completed).toBeGreaterThan(0)
      expect(body.data.shortlisted_count).toBeGreaterThan(0)
      expect(Array.isArray(body.data.recent_requests)).toBe(true)
      expect(body.data.recent_requests.length).toBeGreaterThan(0)
    })

    it('Creator stats return role-aware counts, average rating and completeness', async () => {
      setTestSessionToken(demoCreatorToken)
      const res = await getDashboardStatsHandler()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)

      expect(body.data).toHaveProperty('pending')
      expect(body.data).toHaveProperty('accepted')
      expect(body.data).toHaveProperty('completed')
      expect(body.data).toHaveProperty('average_rating')
      expect(body.data.profile_completeness).toBeGreaterThan(0)
    })
  })
})
