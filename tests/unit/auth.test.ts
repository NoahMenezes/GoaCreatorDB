import { describe, it, expect } from 'bun:test'
import { hashPassword, verifyPassword } from '@/lib/auth'

describe('Password hashing', () => {
  it('should hash a password and verify it correctly', async () => {
    const password = 'testpassword123'
    const hash = await hashPassword(password)

    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(0)

    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject incorrect passwords', async () => {
    const hash = await hashPassword('correctpassword')
    const isValid = await verifyPassword('wrongpassword', hash)
    expect(isValid).toBe(false)
  })

  it('should produce different hashes for the same password', async () => {
    const hash1 = await hashPassword('samepassword')
    const hash2 = await hashPassword('samepassword')
    expect(hash1).not.toBe(hash2)
  })
})

describe('Input validation', () => {
  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('user@example.com')).toBe(true)
    expect(emailRegex.test('invalid-email')).toBe(false)
    expect(emailRegex.test('')).toBe(false)
  })

  it('should validate password minimum length', () => {
    const minLength = 6
    expect('password'.length >= minLength).toBe(true)
    expect('12345'.length >= minLength).toBe(false)
  })
})