import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import crypto from 'crypto'
import { query, closePool } from '@/lib/db'
import {
  registerUser,
  loginUser,
  getSession,
  requireUser,
  requireRoleForToken,
  AuthError,
  clearAllRateLimits,
} from '@/lib/auth'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { POST as loginHandler } from '@/app/api/auth/login/route'
import { POST as forgotPasswordHandler } from '@/app/api/auth/forgot-password/route'
import { POST as resetPasswordHandler } from '@/app/api/auth/reset-password/route'
import { proxy } from '@/proxy'
import { NextRequest } from 'next/server'

describe('Authentication & Authorization Suite', () => {
  let validLocationId: number

  beforeAll(async () => {
    // Fetch valid reference IDs
    const locRes = await query<{ location_id: number }>('SELECT location_id FROM locations LIMIT 1')
    validLocationId = locRes.rows[0].location_id
  })

  afterAll(async () => {
    // Clean up test data
    await query(`
      DELETE FROM sessions WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE '%@authtest.com');
      DELETE FROM password_reset_tokens WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE '%@authtest.com');
      DELETE FROM businesses WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE '%@authtest.com');
      DELETE FROM creators WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE '%@authtest.com');
      DELETE FROM users WHERE email LIKE '%@authtest.com';
    `)
    clearAllRateLimits()
    await closePool()
  })

  // ---------------------------------------------------------------------------
  // 1. Registration Rollback when second insert fails
  // ---------------------------------------------------------------------------
  describe('Registration Transaction Rollback', () => {
    it('should rollback the user insert when the profile insert fails', async () => {
      const email = 'rollback_test@authtest.com'
      await query('DELETE FROM users WHERE email = $1', [email])

      // Attempt to register with a non-existent location_id that bypasses pre-check or triggers DB error
      // By passing an invalid creator category or causing a database constraint failure:
      // Let's pass a negative min_paid_rate (-1000), which violates ck_creators_min_paid_rate constraint
      const registerPromise = registerUser({
        email,
        password: 'password123',
        role: 'creator',
        location_id: validLocationId,
        creatorData: {
          full_name: 'Test Rollback',
          location_id: validLocationId,
          min_paid_rate: -5000, // Violates ck_creators_min_paid_rate (min_paid_rate >= 0)
          accepts_barter: true,
        },
      })

      await expect(registerPromise).rejects.toThrow()

      // Verify users row was completely rolled back and does not exist in the database
      const userRes = await query('SELECT user_id FROM users WHERE email = $1', [email])
      expect(userRes.rows.length).toBe(0)
    })
  })

  // ---------------------------------------------------------------------------
  // 2. Duplicate Email Registration
  // ---------------------------------------------------------------------------
  describe('Duplicate Email Handling', () => {
    it('should reject duplicate email registration with 409 status', async () => {
      const email = 'duplicate_test@authtest.com'
      await query('DELETE FROM users WHERE email = $1', [email])

      // First registration succeeds
      const firstReg = await registerUser({
        email,
        password: 'password123',
        role: 'business',
        location_id: validLocationId,
        businessData: {
          business_name: 'Initial Business',
          contact_phone: '+91 99999 11111',
        },
      })
      expect(firstReg.user.email).toBe(email)

      // Second registration with same email (even with different case)
      const req = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toUpperCase(),
          password: 'anotherpassword123',
          role: 'business',
          location_id: validLocationId,
          businessData: {
            business_name: 'Duplicate Business',
          },
        }),
      })

      const res = await registerHandler(req)
      expect(res.status).toBe(409)
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('already exists')
    })
  })

  // ---------------------------------------------------------------------------
  // 3. Role Constraints & Wrong-Role Access (403)
  // ---------------------------------------------------------------------------
  describe('Role-Based Access Control & 403 Rejections', () => {
    it('should reject registration with role=admin with 403 status', async () => {
      const req = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wannabe_admin@authtest.com',
          password: 'password123',
          role: 'admin',
          location_id: validLocationId,
        }),
      })

      const res = await registerHandler(req)
      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data.error).toContain('Admin accounts cannot be registered')
    })

    it('should reject wrong-role access with 403 via requireRole', async () => {
      const email = 'business_role_check@authtest.com'
      await query('DELETE FROM users WHERE email = $1', [email])

      const { token } = await registerUser({
        email,
        password: 'password123',
        role: 'business',
        location_id: validLocationId,
        businessData: {
          business_name: 'Role Check Business',
        },
      })

      // Business user attempting to access a creator-only role
      const checkPromise = requireRoleForToken(token, 'creator')
      await expect(checkPromise).rejects.toThrow()

      try {
        await requireRoleForToken(token, 'creator')
      } catch (err: unknown) {
        expect(err instanceof AuthError).toBe(true)
        if (err instanceof AuthError) {
          expect(err.status).toBe(403)
          expect(err.message).toContain('Forbidden')
        }
      }
    })

    it('should reject wrong-role route access in Next.js 16 proxy with 403', async () => {
      const email = 'proxy_role_check@authtest.com'
      await query('DELETE FROM users WHERE email = $1', [email])

      const { token } = await registerUser({
        email,
        password: 'password123',
        role: 'business',
        location_id: validLocationId,
        businessData: {
          business_name: 'Proxy Check Business',
        },
      })

      // Business user accessing /creator/dashboard
      const req = new NextRequest('http://localhost:3000/creator/dashboard', {
        headers: {
          cookie: `goa_session=${token}`,
        },
      })

      const res = await proxy(req)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toContain('Forbidden: Creator access required')
    })
  })

  // ---------------------------------------------------------------------------
  // 4. Expired Sessions & Lazy Cleanup
  // ---------------------------------------------------------------------------
  describe('Session Expiration & Cleanup', () => {
    it('should reject expired session token with 401', async () => {
      const email = 'expired_session@authtest.com'
      await query('DELETE FROM users WHERE email = $1', [email])

      const { user } = await registerUser({
        email,
        password: 'password123',
        role: 'creator',
        location_id: validLocationId,
        creatorData: {
          full_name: 'Expired Session User',
        },
      })

      // Manually insert an expired session
      const expiredToken = 'expired-token-' + crypto.randomUUID()
      const pastDate = new Date(Date.now() - 60 * 1000) // 1 minute ago
      await query(
        `INSERT INTO sessions (token, user_id, expires_at)
         VALUES ($1, $2, $3)`,
        [expiredToken, user.user_id, pastDate]
      )

      // getSession should return null
      const session = await getSession(expiredToken)
      expect(session).toBeNull()

      // requireUser should throw 401 AuthError
      await expect(requireUser(expiredToken)).rejects.toThrow()
      try {
        await requireUser(expiredToken)
      } catch (err: unknown) {
        expect(err instanceof AuthError).toBe(true)
        if (err instanceof AuthError) {
          expect(err.status).toBe(401)
        }
      }

      // Logging in should trigger lazy cleanup and remove the expired session
      await loginUser(email, 'password123')
      const checkRes = await query('SELECT session_id FROM sessions WHERE token = $1', [expiredToken])
      expect(checkRes.rows.length).toBe(0)
    })
  })

  // ---------------------------------------------------------------------------
  // 5. Password Reset Single-Use & Token Reuse Prevention
  // ---------------------------------------------------------------------------
  describe('Password Reset Token Single-Use', () => {
    it('should allow password reset once and reject subsequent reuse of the same token', async () => {
      const email = 'reset_reuse@authtest.com'
      await query('DELETE FROM users WHERE email = $1', [email])

      const { user } = await registerUser({
        email,
        password: 'initialpassword123',
        role: 'business',
        location_id: validLocationId,
        businessData: { business_name: 'Reset Test Biz' },
      })

      // Generate a raw reset token and store only its SHA-256 hash
      const rawToken = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
      const expiresAt = new Date(Date.now() + 3600 * 1000) // 1 hour

      await query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.user_id, tokenHash, expiresAt]
      )

      // First reset attempt with valid token -> Must succeed
      const firstReq = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: rawToken,
          password: 'newsecurepassword123',
        }),
      })

      const firstRes = await resetPasswordHandler(firstReq)
      expect(firstRes.status).toBe(200)
      const firstData = await firstRes.json()
      expect(firstData.success).toBe(true)

      // Can login with new password
      const loginRes = await loginUser(email, 'newsecurepassword123')
      expect(loginRes.user.email).toBe(email)

      // Second reset attempt with THE SAME token -> Must be rejected (single use)
      const secondReq = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: rawToken,
          password: 'anotherpassword123',
        }),
      })

      const secondRes = await resetPasswordHandler(secondReq)
      expect(secondRes.status).toBe(400)
      const secondData = await secondRes.json()
      expect(secondData.success).toBe(false)
      expect(secondData.error).toContain('Invalid or expired reset token')
    })
  })

  // ---------------------------------------------------------------------------
  // 6. Location ID Validation (422)
  // ---------------------------------------------------------------------------
  describe('Location Validation', () => {
    it('should return 422 if location_id is missing or non-existent', async () => {
      const req = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid_loc@authtest.com',
          password: 'password123',
          role: 'business',
          location_id: 999999, // Non-existent location ID
          businessData: { business_name: 'No Location Biz' },
        }),
      })

      const res = await registerHandler(req)
      expect(res.status).toBe(422)
      const data = await res.json()
      expect(data.error).toContain('valid location_id is required')
    })
  })

  // ---------------------------------------------------------------------------
  // 7. Rate Limiting on Login
  // ---------------------------------------------------------------------------
  describe('Rate Limiting', () => {
    it('should enforce rate limiting after repeated failed login attempts via function', async () => {
      const email = 'ratelimit_target@authtest.com'
      const clientIp = '192.168.1.100'

      // Perform 5 failed attempts
      for (let i = 0; i < 5; i++) {
        try {
          await loginUser(email, 'wrongpass', clientIp)
        } catch {
          // Expected 401
        }
      }

      // 6th attempt should be blocked with 429
      try {
        await loginUser(email, 'wrongpass', clientIp)
        expect.unreachable('Should have thrown 429 error')
      } catch (err: unknown) {
        expect(err instanceof AuthError).toBe(true)
        if (err instanceof AuthError) {
          expect(err.status).toBe(429)
          expect(err.message).toContain('Too many login attempts')
        }
      }
    })

    it('should enforce 429 rate limit via POST /api/auth/login endpoint', async () => {
      const email = 'ratelimit_http@authtest.com'
      const clientIp = '192.168.1.101'

      // Perform 5 failed login attempts over HTTP
      for (let i = 0; i < 5; i++) {
        const req = new Request('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': clientIp,
          },
          body: JSON.stringify({ email, password: 'wrongpassword' }),
        })
        const res = await loginHandler(req)
        expect(res.status).toBe(401)
      }

      // 6th attempt must return HTTP 429
      const reqBlocked = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': clientIp,
        },
        body: JSON.stringify({ email, password: 'wrongpassword' }),
      })
      const resBlocked = await loginHandler(reqBlocked)
      expect(resBlocked.status).toBe(429)
      const dataBlocked = await resBlocked.json()
      expect(dataBlocked.error).toContain('Too many login attempts')
    })
  })

  // ---------------------------------------------------------------------------
  // 8. Production Safety & Dev-Only Behavior
  // ---------------------------------------------------------------------------
  describe('Production Safety Safeguards', () => {
    it('forgot-password returns reset_url only when NODE_ENV !== production', async () => {
      const originalEnv = process.env.NODE_ENV

      // Seed a user for forgot-password
      const email = 'forgot_prod_test@authtest.com'
      await registerUser({
        email,
        password: 'Password123!',
        role: 'business',
        business_name: 'Prod Forgot Cafe',
        location_id: validLocationId,
      })

      // 1. In non-production (e.g. test / development): reset_url IS present
      process.env.NODE_ENV = 'development'
      const devReq = new Request('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const devRes = await forgotPasswordHandler(devReq)
      const devData = await devRes.json()
      expect(devRes.status).toBe(200)
      expect(devData.reset_url).toBeDefined()
      expect(devData.reset_url).toContain('/reset-password?token=')

      // 2. In production: reset_url is strictly omitted
      process.env.NODE_ENV = 'production'
      const prodReq = new Request('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const prodRes = await forgotPasswordHandler(prodReq)
      const prodData = await prodRes.json()
      expect(prodRes.status).toBe(200)
      expect(prodData.reset_url).toBeUndefined()
      expect(prodData.reset_token).toBeUndefined()
      expect(prodData.message).toContain('If an account exists')

      // Restore environment
      process.env.NODE_ENV = originalEnv
    })

    it('requires AUTH_SECRET in production mode', async () => {
      const originalEnv = process.env.NODE_ENV
      const originalSecret = process.env.AUTH_SECRET

      process.env.NODE_ENV = 'production'
      delete process.env.AUTH_SECRET

      // Attempting to register or login in production without AUTH_SECRET throws fatal error
      try {
        await loginUser('admin@goaconnect.in', 'admin123')
        expect.unreachable('Should have thrown missing AUTH_SECRET error')
      } catch (err: unknown) {
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toContain('FATAL: AUTH_SECRET environment variable is required in production')
      }

      // Restoring AUTH_SECRET allows execution
      process.env.AUTH_SECRET = 'super-secret-auth-key-production-32-chars'
      // Should not throw missing AUTH_SECRET
      try {
        await loginUser('admin@goaconnect.in', 'admin123')
      } catch (err: unknown) {
        expect((err as Error).message).not.toContain('FATAL: AUTH_SECRET')
      }

      // Restore environment
      process.env.NODE_ENV = originalEnv
      process.env.AUTH_SECRET = originalSecret
    })

    it('sets Secure cookie in production mode', async () => {
      const originalEnv = process.env.NODE_ENV
      const originalSecret = process.env.AUTH_SECRET
      process.env.NODE_ENV = 'production'
      process.env.AUTH_SECRET = 'super-secret-auth-key-production-32-chars'

      const req = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
        body: JSON.stringify({ email: 'admin@goaconnect.in', password: 'admin123' }),
      })
      const res = await loginHandler(req)
      expect(res.status).toBe(200)

      const cookieHeader = res.headers.get('set-cookie') || ''
      expect(cookieHeader.toLowerCase()).toContain('secure')

      // Restore environment
      process.env.NODE_ENV = originalEnv
      process.env.AUTH_SECRET = originalSecret
    })
  })
})
