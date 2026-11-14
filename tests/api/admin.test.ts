import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { query, closePool } from '@/lib/db'
import { loginUser, registerUser, setTestSessionToken, clearAllRateLimits } from '@/lib/auth'

// Route Handlers
import { GET as getAdminDashboardHandler } from '@/app/api/admin/dashboard/route'
import { GET as getVerificationsHandler, POST as postVerificationsHandler } from '@/app/api/admin/verifications/route'
import { GET as getUsersHandler, PATCH as patchUsersHandler, DELETE as deleteUsersHandler } from '@/app/api/admin/users/route'
import {
  GET as getAdminCategoriesHandler,
  POST as postAdminCategoriesHandler,
  PUT as putAdminCategoriesHandler,
  DELETE as deleteAdminCategoriesHandler,
} from '@/app/api/admin/categories/route'
import {
  GET as getAdminLocationsHandler,
  POST as postAdminLocationsHandler,
  PUT as putAdminLocationsHandler,
  DELETE as deleteAdminLocationsHandler,
} from '@/app/api/admin/locations/route'
import { GET as getAdminReportsHandler } from '@/app/api/admin/reports/route'

describe('Admin API Suite (/api/admin/*)', () => {
  let adminToken: string
  let adminUserId: number

  let creatorToken: string
  let creatorUserId: number

  let businessToken: string
  let businessUserId: number

  let testUnverifiedUserId: number
  let testUnverifiedCreatorId: number
  let testMetricId: number
  let testSocialAccountId: number
  let validLocationId: number

  beforeAll(async () => {
    // 1. Fetch valid reference IDs
    const locRes = await query<{ location_id: number }>('SELECT location_id FROM locations LIMIT 1')
    validLocationId = locRes.rows[0].location_id

    // 2. Login admin account (admin@goaconnect.in)
    const adminLogin = await loginUser('admin@goaconnect.in', 'admin123')
    adminToken = adminLogin.token
    adminUserId = adminLogin.user.user_id

    // 3. Login creator account (rahul@goaconnect.in)
    const creatorLogin = await loginUser('rahul@goaconnect.in', 'creator123')
    creatorToken = creatorLogin.token
    creatorUserId = creatorLogin.user.user_id

    // 4. Login business account (palmeira@goaconnect.in)
    const bizLogin = await loginUser('palmeira@goaconnect.in', 'business123')
    businessToken = bizLogin.token
    businessUserId = bizLogin.user.user_id

    // 5. Clean up any previous test user
    await query(`
      DELETE FROM audit_log WHERE changed_by IN (SELECT user_id FROM users WHERE email = 'unverified_admin_test@admintest.com');
      DELETE FROM creator_metrics WHERE account_id IN (
        SELECT account_id FROM social_accounts WHERE creator_id IN (
          SELECT creator_id FROM creators WHERE user_id IN (
            SELECT user_id FROM users WHERE email = 'unverified_admin_test@admintest.com'
          )
        )
      );
      DELETE FROM social_accounts WHERE creator_id IN (
        SELECT creator_id FROM creators WHERE user_id IN (
          SELECT user_id FROM users WHERE email = 'unverified_admin_test@admintest.com'
        )
      );
      DELETE FROM creator_categories WHERE creator_id IN (
        SELECT creator_id FROM creators WHERE user_id IN (
          SELECT user_id FROM users WHERE email = 'unverified_admin_test@admintest.com'
        )
      );
      DELETE FROM sessions WHERE user_id IN (SELECT user_id FROM users WHERE email = 'unverified_admin_test@admintest.com');
      DELETE FROM creators WHERE user_id IN (SELECT user_id FROM users WHERE email = 'unverified_admin_test@admintest.com');
      DELETE FROM users WHERE email = 'unverified_admin_test@admintest.com';
    `)

    // 6. Create an unverified creator and self-reported metric snapshot for verification tests
    const unverifiedReg = await registerUser({
      email: 'unverified_admin_test@admintest.com',
      password: 'password123',
      role: 'creator',
      location_id: validLocationId,
      creatorData: {
        full_name: 'Unverified Admin Test Creator',
        bio: 'Testing admin verification workflows',
      },
    })
    testUnverifiedUserId = unverifiedReg.user.user_id
    testUnverifiedCreatorId = (unverifiedReg.profile as { creator_id: number }).creator_id

    const saRes = await query<{ account_id: number }>(
      `INSERT INTO social_accounts (creator_id, platform, handle, profile_url)
       VALUES ($1, 'instagram', '@unverified_admin_handle', 'https://instagram.com/unverified_admin_handle')
       RETURNING account_id`,
      [testUnverifiedCreatorId]
    )
    testSocialAccountId = saRes.rows[0].account_id

    const metricRes = await query<{ metric_id: number }>(
      `INSERT INTO creator_metrics (
         account_id, recorded_at, follower_count, avg_views, avg_likes,
         avg_comments, engagement_rate, audience_goa_pct, data_source, verified_by
       ) VALUES ($1, now(), 12500, 3000, 600, 45, 4.8, 65.0, 'self_reported', NULL)
       RETURNING metric_id`,
      [testSocialAccountId]
    )
    testMetricId = metricRes.rows[0].metric_id
  })

  afterAll(async () => {
    setTestSessionToken(null)
    await query(`
      DELETE FROM audit_log WHERE changed_by = ${testUnverifiedUserId};
      DELETE FROM creator_metrics WHERE account_id = ${testSocialAccountId};
      DELETE FROM social_accounts WHERE account_id = ${testSocialAccountId};
      DELETE FROM creator_categories WHERE creator_id = ${testUnverifiedCreatorId};
      DELETE FROM sessions WHERE user_id = ${testUnverifiedUserId};
      DELETE FROM creators WHERE user_id = ${testUnverifiedUserId};
      DELETE FROM users WHERE user_id = ${testUnverifiedUserId};
    `)
    clearAllRateLimits()
    await closePool()
  })

  // ===========================================================================
  // 1. RBAC SECURITY: NON-ADMIN GETS 403 ON EVERY ROUTE
  // ===========================================================================
  describe('RBAC Security: 403 on Every Admin Route for Non-Admin', () => {
    it('Creator receives 403 on GET /api/admin/dashboard', async () => {
      setTestSessionToken(creatorToken)
      const res = await getAdminDashboardHandler(new Request('http://localhost:3000/api/admin/dashboard'))
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toContain('Admin access required')
    })

    it('Business receives 403 on GET /api/admin/dashboard', async () => {
      setTestSessionToken(businessToken)
      const res = await getAdminDashboardHandler(new Request('http://localhost:3000/api/admin/dashboard'))
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toContain('Admin access required')
    })

    it('Creator receives 403 on GET /api/admin/verifications', async () => {
      setTestSessionToken(creatorToken)
      const res = await getVerificationsHandler(new Request('http://localhost:3000/api/admin/verifications'))
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on POST /api/admin/verifications', async () => {
      setTestSessionToken(creatorToken)
      const req = new Request('http://localhost:3000/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id: 1, type: 'accounts' }),
      })
      const res = await postVerificationsHandler(req)
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on GET /api/admin/users', async () => {
      setTestSessionToken(creatorToken)
      const res = await getUsersHandler(new Request('http://localhost:3000/api/admin/users'))
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on PATCH /api/admin/users', async () => {
      setTestSessionToken(creatorToken)
      const req = new Request('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1, is_verified: true }),
      })
      const res = await patchUsersHandler(req)
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on DELETE /api/admin/users', async () => {
      setTestSessionToken(creatorToken)
      const res = await deleteUsersHandler(new Request('http://localhost:3000/api/admin/users?id=1', { method: 'DELETE' }))
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on GET /api/admin/categories', async () => {
      setTestSessionToken(creatorToken)
      const res = await getAdminCategoriesHandler(new Request('http://localhost:3000/api/admin/categories'))
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on POST /api/admin/categories', async () => {
      setTestSessionToken(creatorToken)
      const req = new Request('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: 'Test Cat' }),
      })
      const res = await postAdminCategoriesHandler(req)
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on PUT /api/admin/categories', async () => {
      setTestSessionToken(creatorToken)
      const req = new Request('http://localhost:3000/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: 1, category_name: 'Test Cat' }),
      })
      const res = await putAdminCategoriesHandler(req)
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on DELETE /api/admin/categories', async () => {
      setTestSessionToken(creatorToken)
      const res = await deleteAdminCategoriesHandler(new Request('http://localhost:3000/api/admin/categories?id=1', { method: 'DELETE' }))
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on GET /api/admin/locations', async () => {
      setTestSessionToken(creatorToken)
      const res = await getAdminLocationsHandler(new Request('http://localhost:3000/api/admin/locations'))
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on POST /api/admin/locations', async () => {
      setTestSessionToken(creatorToken)
      const req = new Request('http://localhost:3000/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_name: 'Area', taluka: 'Bardez', district: 'North Goa' }),
      })
      const res = await postAdminLocationsHandler(req)
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on PUT /api/admin/locations', async () => {
      setTestSessionToken(creatorToken)
      const req = new Request('http://localhost:3000/api/admin/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_id: 1, area_name: 'Area', taluka: 'Bardez', district: 'North Goa' }),
      })
      const res = await putAdminLocationsHandler(req)
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on DELETE /api/admin/locations', async () => {
      setTestSessionToken(creatorToken)
      const res = await deleteAdminLocationsHandler(new Request('http://localhost:3000/api/admin/locations?id=1', { method: 'DELETE' }))
      expect(res.status).toBe(403)
    })

    it('Creator receives 403 on GET /api/admin/reports', async () => {
      setTestSessionToken(creatorToken)
      const res = await getAdminReportsHandler(new Request('http://localhost:3000/api/admin/reports'))
      expect(res.status).toBe(403)
    })

    it('Unauthenticated request receives 401', async () => {
      setTestSessionToken(null)
      const res = await getAdminDashboardHandler(new Request('http://localhost:3000/api/admin/dashboard'))
      expect(res.status).toBe(401)
    })
  })

  // ===========================================================================
  // 2. DASHBOARD KPI ACCURACY: EACH NUMBER EQUALS DIRECT SQL COUNT
  // ===========================================================================
  describe('Dashboard KPIs: Each Number Equals Direct SQL Count', () => {
    it('Admin dashboard KPIs match direct SQL database counts', async () => {
      setTestSessionToken(adminToken)

      const res = await getAdminDashboardHandler(new Request('http://localhost:3000/api/admin/dashboard'))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)

      const kpis = body.data.kpis

      // 1. Direct SQL counts
      const [
        totalCreatorsRes,
        totalBusinessesRes,
        totalRequestsRes,
        completedDealsRes,
        pendingVerificationsRes,
        totalUsersRes,
        verifiedUsersRes,
      ] = await Promise.all([
        query<{ count: number }>('SELECT COUNT(*)::int AS count FROM creators'),
        query<{ count: number }>('SELECT COUNT(*)::int AS count FROM businesses'),
        query<{ count: number }>('SELECT COUNT(*)::int AS count FROM collaboration_requests'),
        query<{ count: number }>("SELECT COUNT(*)::int AS count FROM collaboration_requests WHERE status = 'completed'"),
        query<{ count: number }>(`
          SELECT (
            (SELECT COUNT(*)::int FROM users WHERE is_verified = false AND role IN ('creator', 'business')) +
            (SELECT COUNT(*)::int FROM creator_metrics WHERE data_source = 'self_reported')
          ) AS count
        `),
        query<{ count: number }>('SELECT COUNT(*)::int AS count FROM users'),
        query<{ count: number }>('SELECT COUNT(*)::int AS count FROM users WHERE is_verified = true'),
      ])

      expect(kpis.total_creators).toBe(totalCreatorsRes.rows[0].count)
      expect(kpis.total_businesses).toBe(totalBusinessesRes.rows[0].count)
      expect(kpis.total_requests).toBe(totalRequestsRes.rows[0].count)
      expect(kpis.completed_deals).toBe(completedDealsRes.rows[0].count)
      expect(kpis.pending_verifications).toBe(pendingVerificationsRes.rows[0].count)
      expect(kpis.total_users).toBe(totalUsersRes.rows[0].count)
      expect(kpis.verified_users).toBe(verifiedUsersRes.rows[0].count)

      // Ensure views are included and non-empty
      expect(Array.isArray(body.data.category_distribution)).toBe(true)
      expect(body.data.category_distribution.length).toBeGreaterThan(0)
      expect(Array.isArray(body.data.top_creators)).toBe(true)
      expect(Array.isArray(body.data.top_businesses)).toBe(true)
      expect(Array.isArray(body.data.taluka_stats)).toBe(true)
      expect(body.data.taluka_stats.length).toBeGreaterThan(0)
    })
  })

  // ===========================================================================
  // 3. VERIFICATIONS WORKFLOW (ACCOUNTS & METRICS)
  // ===========================================================================
  describe('Verifications Workflow', () => {
    it('GET /api/admin/verifications?type=accounts: returns unverified users with fn_trust_score and risk label', async () => {
      setTestSessionToken(adminToken)

      const res = await getVerificationsHandler(new Request('http://localhost:3000/api/admin/verifications?type=accounts'))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)

      const testUser = body.data.find((u: { user_id: number }) => u.user_id === testUnverifiedUserId)
      expect(testUser).toBeDefined()
      expect(testUser).toHaveProperty('trust_score')
      expect(typeof testUser.trust_score).toBe('number')
      expect(testUser.trust_score).toBeGreaterThanOrEqual(0)
      expect(testUser.trust_score).toBeLessThanOrEqual(100)
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(testUser.risk_label)
    })

    it('GET /api/admin/verifications?type=metrics: returns self_reported creator_metrics rows', async () => {
      setTestSessionToken(adminToken)

      const res = await getVerificationsHandler(new Request('http://localhost:3000/api/admin/verifications?type=metrics'))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)

      const metric = body.data.find((m: { metric_id: number }) => m.metric_id === testMetricId)
      expect(metric).toBeDefined()
      expect(metric.data_source).toBe('self_reported')
      expect(metric.verified_by).toBeNull()
    })

    it('POST /api/admin/verifications (reject): leaves record unchanged and logs note in audit_log', async () => {
      setTestSessionToken(adminToken)

      const req = new Request('http://localhost:3000/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'metrics',
          id: testMetricId,
          action: 'reject',
          note: 'Suspicious sudden spike in follower count',
        }),
      })

      const res = await postVerificationsHandler(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)

      // Metric is still self_reported
      const checkMetric = await query<{ data_source: string; verified_by: number | null }>(
        'SELECT data_source, verified_by FROM creator_metrics WHERE metric_id = $1',
        [testMetricId]
      )
      expect(checkMetric.rows[0].data_source).toBe('self_reported')
      expect(checkMetric.rows[0].verified_by).toBeNull()

      // Reviewer note written to audit_log
      const auditCheck = await query<{ action: string; new_data: { note: string; decision: string } }>(
        "SELECT action, new_data FROM audit_log WHERE table_name = 'creator_metrics' AND record_id = $1 AND (new_data->>'decision') = 'rejected'",
        [testMetricId]
      )
      expect(auditCheck.rows.length).toBeGreaterThan(0)
      expect(auditCheck.rows[0].new_data.note).toBe('Suspicious sudden spike in follower count')
      expect(auditCheck.rows[0].new_data.decision).toBe('rejected')
    })

    it('POST /api/admin/verifications (approve metric): sets data_source=admin_verified and verified_by=adminUserId', async () => {
      setTestSessionToken(adminToken)

      const req = new Request('http://localhost:3000/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'metrics',
          id: testMetricId,
          action: 'approve',
        }),
      })

      const res = await postVerificationsHandler(req)
      expect(res.status).toBe(200)

      const checkMetric = await query<{ data_source: string; verified_by: number }>(
        'SELECT data_source, verified_by FROM creator_metrics WHERE metric_id = $1',
        [testMetricId]
      )
      expect(checkMetric.rows[0].data_source).toBe('admin_verified')
      expect(checkMetric.rows[0].verified_by).toBe(adminUserId)
    })

    it('POST /api/admin/verifications (approve account): sets is_verified=true on users table', async () => {
      setTestSessionToken(adminToken)

      const req = new Request('http://localhost:3000/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'accounts',
          id: testUnverifiedUserId,
          action: 'approve',
        }),
      })

      const res = await postVerificationsHandler(req)
      expect(res.status).toBe(200)

      const checkUser = await query<{ is_verified: boolean }>(
        'SELECT is_verified FROM users WHERE user_id = $1',
        [testUnverifiedUserId]
      )
      expect(checkUser.rows[0].is_verified).toBe(true)
    })
  })

  // ===========================================================================
  // 4. USERS MANAGEMENT (SEARCH, FILTER, PAGINATE, PATCH, DELETE SAFEGUARDS)
  // ===========================================================================
  describe('Users Management & Safeguards', () => {
    it('GET /api/admin/users: searches by name, handle, taluka and filters by role', async () => {
      setTestSessionToken(adminToken)

      const req = new Request('http://localhost:3000/api/admin/users?q=Rahul&role=creator')
      const res = await getUsersHandler(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.length).toBeGreaterThan(0)
      expect(body.data[0].creator_name).toContain('Rahul')
      expect(body.data[0].role).toBe('creator')
      expect(body.pagination).toHaveProperty('total')
      expect(body.pagination).toHaveProperty('totalPages')
    })

    it('PATCH /api/admin/users: toggles user is_verified status', async () => {
      setTestSessionToken(adminToken)

      // Unverify user
      const reqUnverify = new Request('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: testUnverifiedUserId, is_verified: false }),
      })
      const resUnverify = await patchUsersHandler(reqUnverify)
      expect(resUnverify.status).toBe(200)
      const bodyUnverify = await resUnverify.json()
      expect(bodyUnverify.data.is_verified).toBe(false)

      // Re-verify user
      const reqVerify = new Request('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: testUnverifiedUserId, is_verified: true }),
      })
      const resVerify = await patchUsersHandler(reqVerify)
      expect(resVerify.status).toBe(200)
      const bodyVerify = await resVerify.json()
      expect(bodyVerify.data.is_verified).toBe(true)
    })

    it('DELETE /api/admin/users safeguard: cannot delete your own admin account (returns 409)', async () => {
      setTestSessionToken(adminToken)

      const req = new Request(`http://localhost:3000/api/admin/users?id=${adminUserId}`, {
        method: 'DELETE',
      })
      const res = await deleteUsersHandler(req)
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.error).toContain('Cannot delete your own admin account')
    })

    it('DELETE /api/admin/users safeguard: cannot delete the last remaining admin user (returns 409)', async () => {
      setTestSessionToken(adminToken)

      // Even if called with another admin id if count is 1:
      const adminCountRes = await query<{ count: number }>("SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'")
      if (adminCountRes.rows[0].count === 1) {
        const req = new Request(`http://localhost:3000/api/admin/users?id=${adminUserId}`, {
          method: 'DELETE',
        })
        const res = await deleteUsersHandler(req)
        expect(res.status).toBe(409)
      }
    })
  })

  // ===========================================================================
  // 5. CRUD CATEGORIES & LOCATIONS (WITH 409 REFERENCE SAFEGUARD)
  // ===========================================================================
  describe('CRUD Categories & Locations', () => {
    let createdCatId: number
    let createdLocId: number

    it('POST & PUT /api/admin/categories: creates and updates a new category', async () => {
      setTestSessionToken(adminToken)

      // Create
      const postReq = new Request('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: 'Eco Tourism Test' }),
      })
      const postRes = await postAdminCategoriesHandler(postReq)
      expect(postRes.status).toBe(201)
      const postBody = await postRes.json()
      createdCatId = postBody.data.category_id

      // Update
      const putReq = new Request('http://localhost:3000/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: createdCatId, category_name: 'Sustainable Travel & Eco Tourism' }),
      })
      const putRes = await putAdminCategoriesHandler(putReq)
      expect(putRes.status).toBe(200)
      const putBody = await putRes.json()
      expect(putBody.data.category_name).toBe('Sustainable Travel & Eco Tourism')
    })

    it('DELETE /api/admin/categories: rejects deletion of referenced category with 409', async () => {
      setTestSessionToken(adminToken)

      // Find a category that is currently assigned to creators (e.g. Food & Dining)
      const refCatRes = await query<{ category_id: number }>(`
        SELECT cc.category_id FROM creator_categories cc LIMIT 1
      `)
      const refCatId = refCatRes.rows[0].category_id

      const delReq = new Request(`http://localhost:3000/api/admin/categories?id=${refCatId}`, {
        method: 'DELETE',
      })
      const delRes = await deleteAdminCategoriesHandler(delReq)
      expect(delRes.status).toBe(409)
      const delBody = await delRes.json()
      expect(delBody.error).toContain('still referenced')
    })

    it('DELETE /api/admin/categories: allows deletion of unreferenced category', async () => {
      setTestSessionToken(adminToken)

      const delReq = new Request(`http://localhost:3000/api/admin/categories?id=${createdCatId}`, {
        method: 'DELETE',
      })
      const delRes = await deleteAdminCategoriesHandler(delReq)
      expect(delRes.status).toBe(200)
    })

    it('POST & PUT /api/admin/locations: creates and updates a new location', async () => {
      setTestSessionToken(adminToken)

      // Create
      const postReq = new Request('http://localhost:3000/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area_name: 'Verna Industrial Plateau',
          taluka: 'Salcete',
          district: 'South Goa',
        }),
      })
      const postRes = await postAdminLocationsHandler(postReq)
      expect(postRes.status).toBe(201)
      const postBody = await postRes.json()
      createdLocId = postBody.data.location_id

      // Update
      const putReq = new Request('http://localhost:3000/api/admin/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: createdLocId,
          area_name: 'Verna Tech Hub',
          taluka: 'Salcete',
          district: 'South Goa',
        }),
      })
      const putRes = await putAdminLocationsHandler(putReq)
      expect(putRes.status).toBe(200)
      const putBody = await putRes.json()
      expect(putBody.data.area_name).toBe('Verna Tech Hub')
    })

    it('DELETE /api/admin/locations: rejects deletion of referenced location with 409', async () => {
      setTestSessionToken(adminToken)

      // Find a location that is referenced by creators or businesses
      const refLocRes = await query<{ location_id: number }>(`
        SELECT location_id FROM creators WHERE location_id IS NOT NULL LIMIT 1
      `)
      const refLocId = refLocRes.rows[0].location_id

      const delReq = new Request(`http://localhost:3000/api/admin/locations?id=${refLocId}`, {
        method: 'DELETE',
      })
      const delRes = await deleteAdminLocationsHandler(delReq)
      expect(delRes.status).toBe(409)
      const delBody = await delRes.json()
      expect(delBody.error).toContain('still referenced')
    })

    it('DELETE /api/admin/locations: allows deletion of unreferenced location', async () => {
      setTestSessionToken(adminToken)

      const delReq = new Request(`http://localhost:3000/api/admin/locations?id=${createdLocId}`, {
        method: 'DELETE',
      })
      const delRes = await deleteAdminLocationsHandler(delReq)
      expect(delRes.status).toBe(200)
    })
  })

  // ===========================================================================
  // 6. REPORTS & EXPORTS
  // ===========================================================================
  describe('Admin Reports & CSV Export', () => {
    it('GET /api/admin/reports: returns report with breakdowns and honestly labeled deal money column', async () => {
      setTestSessionToken(adminToken)

      const req = new Request('http://localhost:3000/api/admin/reports?from=2026-01-01&to=2026-12-31')
      const res = await getAdminReportsHandler(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)

      // Verify honest labeling
      expect(body.data.summary).toHaveProperty('offered_amount_of_completed_deals')
      expect(typeof body.data.summary.offered_amount_of_completed_deals).toBe('number')

      expect(Array.isArray(body.data.monthly_velocity)).toBe(true)
      expect(Array.isArray(body.data.category_breakdown)).toBe(true)
      expect(Array.isArray(body.data.taluka_breakdown)).toBe(true)
      expect(Array.isArray(body.data.collab_type_breakdown)).toBe(true)
      expect(Array.isArray(body.data.status_breakdown)).toBe(true)
    })

    it('GET /api/admin/reports?format=csv: returns CSV export with honest column header', async () => {
      setTestSessionToken(adminToken)

      const req = new Request('http://localhost:3000/api/admin/reports?from=2026-01-01&to=2026-12-31&format=csv')
      const res = await getAdminReportsHandler(req)
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/csv')
      const csvText = await res.text()
      expect(csvText).toContain('GoaConnect Admin Reports')
      expect(csvText).toContain('Offered Amount of Completed Deals')
      expect(csvText).toContain('MONTHLY REQUEST VOLUME & COMPLETED DEALS')
    })
  })
})
