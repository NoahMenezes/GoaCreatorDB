import { test, expect } from '@playwright/test'

test.describe('Goa Connect Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/')
  })

  test('application loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Goa Creator/)
    await expect(page.locator('h1')).toContainText('Find the right Goa creator')
  })

  test('login page is accessible', async ({ page }) => {
    await page.click('text=Sign In')
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1')).toContainText('Welcome back to GoaConnect')
  })

  test('login with demo business credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in business demo credentials
    await page.fill('input[type="email"]', 'palmeira@goaconnect.in')
    await page.fill('input[type="password"]', 'business123')
    
    // Click sign in
    await page.click('button:has-text("Sign In to GoaConnect")')
    
    // Should redirect to business dashboard
    await expect(page).toHaveURL('/business/dashboard')
    await expect(page.locator('h1')).toContainText('Welcome back, Café Palmeira')
  })

  test('login with demo creator credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Switch to creator tab
    await page.click('text=Creator Account')
    
    // Fill in creator demo credentials
    await page.fill('input[type="email"]', 'rahul@goaconnect.in')
    await page.fill('input[type="password"]', 'creator123')
    
    // Click sign in
    await page.click('button:has-text("Sign In to GoaConnect")')
    
    // Should redirect to creator dashboard
    await expect(page).toHaveURL('/creator/dashboard')
    await expect(page.locator('h1')).toContainText('Welcome back, Sneha')
  })

  test('registration page is accessible', async ({ page }) => {
    await page.goto('/join')
    await expect(page.locator('h1')).toContainText('Join GoaConnect')
  })

  test('business registration form works', async ({ page }) => {
    await page.goto('/register/business')
    await expect(page.locator('h1')).toContainText('Register Your Business')
    
    // Fill form fields
    await page.fill('input[placeholder="Café Palmeira"]', 'E2E Test Café')
    await page.fill('input[placeholder="+91 98221 45678"]', '9876543210')
    await page.fill('input[placeholder="cafepalmeiragoa"]', '@e2etestcafe')
    await page.fill('input[placeholder="gm@cafepalmeira.com"]', 'e2etest@example.com')
    await page.fill('input[placeholder="••••••••••••"]', 'securepass123')
    await page.fill('input[placeholder="••••••••••••"]', 'securepass123')
    
    // Agree to terms
    await page.check('input[id="terms"]')
    
    // Submit
    await page.click('button:has-text("Create Business Account")')
    
    // Should redirect to login with pre-filled email
    await expect(page).toHaveURL('/login')
  })

  test('discover creators page loads', async ({ page }) => {
    await page.goto('/business/discover')
    await expect(page.locator('h1')).toContainText('Discover Goan Creators')
  })

  test('business dashboard shows stat cards', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'palmeira@goaconnect.in')
    await page.fill('input[type="password"]', 'business123')
    await page.click('button:has-text("Sign In to GoaConnect")')
    
    await expect(page).toHaveURL('/business/dashboard')
    await expect(page.locator('text=Active Collaborations')).toBeVisible()
    await expect(page.locator('text=Escrow Funds Secured')).toBeVisible()
  })

  test('API creators endpoint returns data', async ({ request }) => {
    const response = await request.get('/api/creators')
    expect(response.ok()).toBe(true)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('API reels endpoint returns data', async ({ request }) => {
    const response = await request.get('/api/reels')
    expect(response.ok()).toBe(true)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('protected API requires authentication', async ({ request }) => {
    const response = await request.get('/api/auth/me')
    const body = await response.json()
    expect(body.authenticated).toBe(false)
  })
})