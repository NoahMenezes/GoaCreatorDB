import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { query, closePool } from '@/lib/db'
import { loginUser, registerUser, setTestSessionToken, clearAllRateLimits } from '@/lib/auth'

// Route Handlers
import { GET as getRequestsHandler, POST as postRequestsHandler } from '@/app/api/requests/route'
import { GET as getRequestByIdHandler, PATCH as patchRequestHandler } from '@/app/api/requests/[id]/route'
import { GET as getCollaborationsHandler } from '@/app/api/collaborations/route'
import { GET as getReviewsHandler, POST as postReviewsHandler } from '@/app/api/reviews/route'
import { GET as getShortlistHandler } from '@/app/api/shortlist/route'
import { PUT as putShortlistHandler, DELETE as deleteShortlistHandler } from '@/app/api/shortlist/[creatorId]/route'
import { GET as getNotificationsHandler, PATCH as patchNotificationsHandler } from '@/app/api/notifications/route'

describe('Collaboration Workflow Integration Suite', () => {
  let bizToken: string
  let bizId: number

  let creatorToken: string
  let creatorId: number

  let thirdPartyToken: string
  let thirdPartyUserId: number

  let validLocationId: number
  const createdRequestIds: number[] = []

  beforeAll(async () => {
    // 1. Fetch valid location
    const locRes = await query<{ location_id: number }>('SELECT location_id FROM locations LIMIT 1')
    validLocationId = locRes.rows[0].location_id

    // 2. Clean up any leftover test data
    await query(`
      DELETE FROM reviews WHERE request_id IN (
        SELECT request_id FROM collaboration_requests WHERE message = 'WORKFLOW_TEST'
      );
      DELETE FROM collaboration_requests WHERE message = 'WORKFLOW_TEST';
      DELETE FROM shortlists WHERE note = 'WORKFLOW_TEST_NOTE';
      DELETE FROM sessions WHERE user_id IN (SELECT user_id FROM users WHERE email = 'thirdparty@workflowtest.com');
      DELETE FROM creators WHERE user_id IN (SELECT user_id FROM users WHERE email = 'thirdparty@workflowtest.com');
      DELETE FROM users WHERE email = 'thirdparty@workflowtest.com';
    `)

    // 3. Login seeded business (Café Palmeira)
    const bizLogin = await loginUser('palmeira@goaconnect.in', 'business123')
    bizToken = bizLogin.token
    bizId = (bizLogin.profile as { business_id: number }).business_id

    // 4. Login seeded creator (Rahul Naik)
    const creatorLogin = await loginUser('rahul@goaconnect.in', 'creator123')
    creatorToken = creatorLogin.token
    creatorId = (creatorLogin.profile as { creator_id: number }).creator_id

    // 5. Register third-party user (to test 404 unauthorized request access)
    const thirdPartyReg = await registerUser({
      email: 'thirdparty@workflowtest.com',
      password: 'password123',
      role: 'creator',
      location_id: validLocationId,
      creatorData: { full_name: 'Third Party Creator' },
    })
    thirdPartyToken = thirdPartyReg.token
    thirdPartyUserId = thirdPartyReg.user.user_id
  })

  afterAll(async () => {
    setTestSessionToken(null)
    if (createdRequestIds.length > 0) {
      await query('DELETE FROM reviews WHERE request_id = ANY($1)', [createdRequestIds])
      await query('DELETE FROM collaboration_requests WHERE request_id = ANY($1)', [createdRequestIds])
    }
    await query(`
      DELETE FROM shortlists WHERE note = 'WORKFLOW_TEST_NOTE';
      DELETE FROM sessions WHERE user_id = ${thirdPartyUserId};
      DELETE FROM creators WHERE user_id = ${thirdPartyUserId};
      DELETE FROM users WHERE user_id = ${thirdPartyUserId};
    `)
    clearAllRateLimits()
    await closePool()
  })

  // ===========================================================================
  // 1. FULL HAPPY PATH WORKFLOW
  // ===========================================================================
  describe('Full Happy Path Workflow', () => {
    let happyRequestId: number
    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    it('1. Business creates a paid collaboration request (POST /api/requests)', async () => {
      setTestSessionToken(bizToken)

      const req = new Request('http://localhost:3000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          collab_type: 'paid',
          offered_amount: 15000,
          deliverables: '1 Instagram Reel + 2 Stories',
          offer_details: 'Promote our weekend brunch special',
          message: 'WORKFLOW_TEST',
          deadline: futureDate,
        }),
      })

      const res = await postRequestsHandler(req)
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('request_id')

      happyRequestId = body.data.request_id
      createdRequestIds.push(happyRequestId)
    })

    it('2. Creator views received requests with counterpart business name (GET /api/requests)', async () => {
      setTestSessionToken(creatorToken)

      const req = new Request('http://localhost:3000/api/requests?status=pending')
      const res = await getRequestsHandler(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)

      const found = body.data.find((r: { request_id: number }) => r.request_id === happyRequestId)
      expect(found).toBeDefined()
      expect(found.business_name).toContain('Palmeira')
      expect(found.status).toBe('pending')
      expect(found.contact_phone).toBeNull() // Hidden while pending!
    })

    it('3. Creator accepts request via PL/pgSQL transaction (PATCH /api/requests/[id])', async () => {
      setTestSessionToken(creatorToken)

      const req = new Request(`http://localhost:3000/api/requests/${happyRequestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      })

      const res = await patchRequestHandler(req, { params: Promise.resolve({ id: String(happyRequestId) }) })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.status).toBe('accepted')
      expect(body.data.responded_at).not.toBeNull()
    })

    it('4. Collaboration appears in v_collaborations for both parties with business_name (GET /api/collaborations)', async () => {
      // Creator checks collaborations
      setTestSessionToken(creatorToken)
      const creatorRes = await getCollaborationsHandler(new Request(`http://localhost:3000/api/collaborations?id=${happyRequestId}`))
      expect(creatorRes.status).toBe(200)
      const creatorBody = await creatorRes.json()
      expect(creatorBody.success).toBe(true)
      expect(creatorBody.data.business_name).toContain('Palmeira')
      expect(creatorBody.data.status).toBe('accepted')

      // Business checks collaborations
      setTestSessionToken(bizToken)
      const bizRes = await getCollaborationsHandler(new Request(`http://localhost:3000/api/collaborations?id=${happyRequestId}`))
      expect(bizRes.status).toBe(200)
      const bizBody = await bizRes.json()
      expect(bizBody.success).toBe(true)
      expect(bizBody.data.creator_name).toContain('Rahul Naik')
      expect(bizBody.data.status).toBe('accepted')
    })

    it('5. Business completes collaboration via PL/pgSQL transaction (PATCH /api/requests/[id])', async () => {
      setTestSessionToken(bizToken)

      const req = new Request(`http://localhost:3000/api/requests/${happyRequestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })

      const res = await patchRequestHandler(req, { params: Promise.resolve({ id: String(happyRequestId) }) })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.status).toBe('completed')
    })

    it('6. Both parties leave mutual reviews after completion (POST /api/reviews)', async () => {
      // 1. Creator reviews Business
      setTestSessionToken(creatorToken)
      const creatorReviewReq = new Request('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: happyRequestId,
          rating: 5,
          comment: 'Great team and prompt payment!',
        }),
      })
      const cRevRes = await postReviewsHandler(creatorReviewReq)
      expect(cRevRes.status).toBe(201)
      const cRevBody = await cRevRes.json()
      expect(cRevBody.success).toBe(true)

      // 2. Business reviews Creator
      setTestSessionToken(bizToken)
      const bizReviewReq = new Request('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: happyRequestId,
          rating: 5,
          comment: 'Exceptional Reel quality and engagement!',
        }),
      })
      const bRevRes = await postReviewsHandler(bizReviewReq)
      expect(bRevRes.status).toBe(201)
      const bRevBody = await bRevRes.json()
      expect(bRevBody.success).toBe(true)

      // 3. Public reviews query by creator_id returns the review
      const publicRevRes = await getReviewsHandler(new Request(`http://localhost:3000/api/reviews?creator_id=${creatorId}`))
      expect(publicRevRes.status).toBe(200)
      const publicRevBody = await publicRevRes.json()
      expect(publicRevBody.success).toBe(true)
      const foundReview = publicRevBody.data.find((r: { request_id: number }) => r.request_id === happyRequestId)
      expect(foundReview).toBeDefined()
      expect(foundReview.rating).toBe(5)
      expect(foundReview.comment).toBe('Exceptional Reel quality and engagement!')
    })
  })

  // ===========================================================================
  // 2. ILLEGAL TRANSITIONS (MUST RETURN 409)
  // ===========================================================================
  describe('Illegal Status Transitions', () => {
    let pendingReqId: number
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    beforeAll(async () => {
      setTestSessionToken(bizToken)
      const req = new Request('http://localhost:3000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          collab_type: 'paid',
          offered_amount: 10000,
          deliverables: '1 Reel',
          message: 'WORKFLOW_TEST',
          deadline: futureDate,
        }),
      })
      const res = await postRequestsHandler(req)
      const data = await res.json()
      pendingReqId = data.data.request_id
      createdRequestIds.push(pendingReqId)
    })

    it('Illegal transition: Creator attempts to complete a pending request (returns 409)', async () => {
      setTestSessionToken(creatorToken)

      const req = new Request(`http://localhost:3000/api/requests/${pendingReqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })

      const res = await patchRequestHandler(req, { params: Promise.resolve({ id: String(pendingReqId) }) })
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toBeDefined()
    })

    it('Illegal transition: Business attempts to complete a request while still pending (returns 409)', async () => {
      setTestSessionToken(bizToken)

      const req = new Request(`http://localhost:3000/api/requests/${pendingReqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })

      const res = await patchRequestHandler(req, { params: Promise.resolve({ id: String(pendingReqId) }) })
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toContain('must be accepted')
    })

    it('Illegal transition: Creator cannot cancel pending request directly (must reject) (returns 409)', async () => {
      setTestSessionToken(creatorToken)

      const req = new Request(`http://localhost:3000/api/requests/${pendingReqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })

      const res = await patchRequestHandler(req, { params: Promise.resolve({ id: String(pendingReqId) }) })
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toContain('reject pending requests')

      // Properly reject it so that this pending pair is cleared for subsequent tests
      await patchRequestHandler(
        new Request(`http://localhost:3000/api/requests/${pendingReqId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reject' }),
        }),
        { params: Promise.resolve({ id: String(pendingReqId) }) }
      )
    })
  })

  // ===========================================================================
  // 3. DUPLICATE PENDING REQUEST (MUST RETURN 409)
  // ===========================================================================
  describe('Duplicate Pending Request Enforcement', () => {
    let dupReqId: number
    const futureDate = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    it('Returns 409 when business attempts to send second pending request to same creator', async () => {
      setTestSessionToken(bizToken)

      // First pending request (should succeed)
      const req1 = new Request('http://localhost:3000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          collab_type: 'paid',
          offered_amount: 12000,
          deliverables: '1 Video',
          message: 'WORKFLOW_TEST',
          deadline: futureDate,
        }),
      })
      const res1 = await postRequestsHandler(req1)
      expect(res1.status).toBe(201)
      const body1 = await res1.json()
      dupReqId = body1.data.request_id
      createdRequestIds.push(dupReqId)

      // Second pending request to the SAME creator while first is still pending (MUST FAIL WITH 409)
      const req2 = new Request('http://localhost:3000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          collab_type: 'paid',
          offered_amount: 14000,
          deliverables: '2 Videos',
          message: 'WORKFLOW_TEST',
          deadline: futureDate,
        }),
      })
      const res2 = await postRequestsHandler(req2)
      expect(res2.status).toBe(409)
      const body2 = await res2.json()
      expect(body2.success).toBe(false)
      expect(body2.error).toContain('pending collaboration request already exists')

      // Reject the first request to free up the pair
      setTestSessionToken(creatorToken)
      await patchRequestHandler(
        new Request(`http://localhost:3000/api/requests/${dupReqId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reject' }),
        }),
        { params: Promise.resolve({ id: String(dupReqId) }) }
      )
    })
  })

  // ===========================================================================
  // 4. USER READING ANOTHER USER'S REQUEST (MUST GET 404)
  // ===========================================================================
  describe('Request Scoping & 404 for Non-Parties', () => {
    let privateRequestId: number
    const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    beforeAll(async () => {
      setTestSessionToken(bizToken)
      const req = new Request('http://localhost:3000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          collab_type: 'paid',
          offered_amount: 11000,
          deliverables: 'Private Collab',
          message: 'WORKFLOW_TEST',
          deadline: futureDate,
        }),
      })
      const res = await postRequestsHandler(req)
      const body = await res.json()
      privateRequestId = body.data.request_id
      createdRequestIds.push(privateRequestId)
    })

    it('User reading another user request MUST get 404', async () => {
      // Third-party creator who is NOT part of this request
      setTestSessionToken(thirdPartyToken)

      const req = new Request(`http://localhost:3000/api/requests/${privateRequestId}`)
      const res = await getRequestByIdHandler(req, { params: Promise.resolve({ id: String(privateRequestId) }) })
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toContain('Request not found')

      // Clear this request by rejecting it
      setTestSessionToken(creatorToken)
      await patchRequestHandler(
        new Request(`http://localhost:3000/api/requests/${privateRequestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reject' }),
        }),
        { params: Promise.resolve({ id: String(privateRequestId) }) }
      )
    })
  })

  // ===========================================================================
  // 5. SECOND REVIEW PREVENTION (MUST RETURN 409)
  // ===========================================================================
  describe('Duplicate Review Prevention', () => {
    let reviewTargetReqId: number
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    beforeAll(async () => {
      // Create, accept and complete a request
      setTestSessionToken(bizToken)
      const req = new Request('http://localhost:3000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          collab_type: 'paid',
          offered_amount: 9000,
          deliverables: 'Review test',
          message: 'WORKFLOW_TEST',
          deadline: futureDate,
        }),
      })
      const res = await postRequestsHandler(req)
      const data = await res.json()
      reviewTargetReqId = data.data.request_id
      createdRequestIds.push(reviewTargetReqId)

      // Accept
      setTestSessionToken(creatorToken)
      await patchRequestHandler(new Request(`http://localhost:3000/api/requests/${reviewTargetReqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      }), { params: Promise.resolve({ id: String(reviewTargetReqId) }) })

      // Complete
      setTestSessionToken(bizToken)
      await patchRequestHandler(new Request(`http://localhost:3000/api/requests/${reviewTargetReqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      }), { params: Promise.resolve({ id: String(reviewTargetReqId) }) })

      // First review from creator
      setTestSessionToken(creatorToken)
      await postReviewsHandler(new Request('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: reviewTargetReqId,
          rating: 4,
          comment: 'Good collaboration overall',
        }),
      }))
    })

    it('Attempting a second review on the same request by the same reviewer returns 409', async () => {
      setTestSessionToken(creatorToken)

      const secondReviewReq = new Request('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: reviewTargetReqId,
          rating: 5,
          comment: 'Trying to review a second time',
        }),
      })

      const res = await postReviewsHandler(secondReviewReq)
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toContain('already submitted a review')
    })
  })

  // ===========================================================================
  // 6. BARTER REQUEST WITHOUT AN AMOUNT (ALLOWED)
  // ===========================================================================
  describe('Barter Request (Amount = 0 or Omitted)', () => {
    const futureDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    it('Barter request with 0 amount is allowed (201 Created)', async () => {
      setTestSessionToken(bizToken)

      const req = new Request('http://localhost:3000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          collab_type: 'barter',
          offered_amount: 0,
          deliverables: '1 Food Tasting Reel',
          offer_details: 'Complimentary 4-course meal for two in exchange for a Reel',
          message: 'WORKFLOW_TEST',
          deadline: futureDate,
        }),
      })

      const res = await postRequestsHandler(req)
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('request_id')

      createdRequestIds.push(body.data.request_id)
    })
  })

  // ===========================================================================
  // 7. SHORTLIST MANAGEMENT (GET, PUT, DELETE)
  // ===========================================================================
  describe('Shortlist Management', () => {
    it('Business can shortlist creator via PUT /api/shortlist/[creatorId]', async () => {
      setTestSessionToken(bizToken)

      const req = new Request(`http://localhost:3000/api/shortlist/${creatorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'WORKFLOW_TEST_NOTE' }),
      })

      const res = await putShortlistHandler(req, { params: Promise.resolve({ creatorId: String(creatorId) }) })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })

    it('Business can view shortlisted creators (GET /api/shortlist)', async () => {
      setTestSessionToken(bizToken)

      const req = new Request('http://localhost:3000/api/shortlist')
      const res = await getShortlistHandler(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
      const found = body.data.find((s: { creator_id: number }) => s.creator_id === creatorId)
      expect(found).toBeDefined()
      expect(found.note).toBe('WORKFLOW_TEST_NOTE')
    })

    it('Business can remove creator from shortlist (DELETE /api/shortlist/[creatorId])', async () => {
      setTestSessionToken(bizToken)

      const req = new Request(`http://localhost:3000/api/shortlist/${creatorId}`, {
        method: 'DELETE',
      })

      const res = await deleteShortlistHandler(req, { params: Promise.resolve({ creatorId: String(creatorId) }) })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)

      // Verify removal
      const checkRes = await query('SELECT * FROM shortlists WHERE business_id = $1 AND creator_id = $2', [bizId, creatorId])
      expect(checkRes.rows.length).toBe(0)
    })
  })

  // ===========================================================================
  // 8. COMPUTED NOTIFICATIONS FEED
  // ===========================================================================
  describe('Computed Notifications Feed (GET & PATCH /api/notifications)', () => {
    it('Creator receives computed notifications feed without a notifications table', async () => {
      setTestSessionToken(creatorToken)

      const res = await getNotificationsHandler(new Request('http://localhost:3000/api/notifications'))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty('id')
        expect(body.data[0]).toHaveProperty('type')
        expect(body.data[0]).toHaveProperty('title')
        expect(body.data[0]).toHaveProperty('message')
      }
    })

    it('Mark as read is a harmless no-op returning success', async () => {
      const res = await patchNotificationsHandler()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })
  })
})
