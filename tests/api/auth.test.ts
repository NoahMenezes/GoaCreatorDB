import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { initDb, closeDb, getDb } from '@/lib/db'
import { registerUser, loginUser } from '@/lib/auth'

describe('Authentication API', () => {
  beforeAll(async () => {
    await initDb()
  })

  afterAll(async () => {
    closeDb()
  })

  const cleanup = async (email: string) => {
    const db = await getDb()
    db.query('DELETE FROM sessions WHERE user_id IN (SELECT user_id FROM users WHERE email = ?)').run(email)
    db.query('DELETE FROM businesses WHERE user_id IN (SELECT user_id FROM users WHERE email = ?)').run(email)
    db.query('DELETE FROM creators WHERE user_id IN (SELECT user_id FROM users WHERE email = ?)').run(email)
    db.query('DELETE FROM users WHERE email = ?').run(email)
  }

  it('should register a new business user', async () => {
    await cleanup('testbiz@example.com')

    const result = await registerUser({
      email: 'testbiz@example.com',
      password: 'securepass123',
      role: 'business',
      businessData: {
        business_name: 'Test Café',
        industry: 'Food & Dining',
        location_id: 'loc-2',
        description: 'A test café',
        contact_phone: '+91 98765 43210',
        instagram_handle: '@testcafe',
      },
    })

    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('testbiz@example.com')
    expect(result.user.role).toBe('business')
    expect(result.token).toBeDefined()
    expect('password_hash' in result.user).toBe(false)
  })

  it('should reject duplicate email registration', async () => {
    // User already exists from previous test
    await expect(
      registerUser({
        email: 'testbiz@example.com',
        password: 'securepass123',
        role: 'business',
        businessData: {
          business_name: 'Test Café 2',
          industry: 'Food & Dining',
          location_id: 'loc-2',
          description: 'Another test café',
          contact_phone: '+91 98765 43211',
          instagram_handle: '@testcafe2',
        },
      })
    ).rejects.toThrow()
  })

  it('should login with correct credentials', async () => {
    const result = await loginUser('testbiz@example.com', 'securepass123')
    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('testbiz@example.com')
    expect(result.token).toBeDefined()
    expect(result.profile).toBeDefined()
    if (result.profile && 'business_name' in result.profile) {
      expect(result.profile.business_name).toBe('Test Café')
    }
  })

  it('should reject login with wrong password', async () => {
    await expect(loginUser('testbiz@example.com', 'wrongpassword')).rejects.toThrow(
      'Invalid email or password'
    )
  })

  it('should reject login with non-existent user', async () => {
    await expect(loginUser('nonexistent@example.com', 'password123')).rejects.toThrow(
      'Invalid email or password'
    )
  })

  it('should register a creator user', async () => {
    await cleanup('testcreator@example.com')

    const result = await registerUser({
      email: 'testcreator@example.com',
      password: 'creatorpass123',
      role: 'creator',
      creatorData: {
        full_name: 'Test Creator',
        location_id: 'loc-1',
        bio: 'A test creator',
        accepts_barter: true,
        min_paid_rate: 8500,
      },
    })

    expect(result.user.role).toBe('creator')
    expect(result.token).toBeDefined()
  })

  it('should validate password minimum length', async () => {
    await expect(
      registerUser({
        email: 'shortpw@example.com',
        password: '12345',
        role: 'creator',
        creatorData: {
          full_name: 'Short PW',
          location_id: 'loc-1',
          bio: 'test',
          accepts_barter: false,
          min_paid_rate: 0,
        },
      })
    ).rejects.toThrow()
  })
})