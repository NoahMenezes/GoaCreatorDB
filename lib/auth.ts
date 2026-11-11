import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import {
    INITIAL_LOCATIONS,
    INITIAL_CATEGORIES,
    type UserRecord,
    type BusinessRecord,
    type CreatorRecord,
    type LocationRecord,
    type CategoryRecord,
} from '@/lib/types'

export type {
    UserRecord,
    BusinessRecord,
    CreatorRecord,
    LocationRecord,
    CategoryRecord,
}
export { INITIAL_LOCATIONS, INITIAL_CATEGORIES }

interface DatabaseSchema {
    users: UserRecord[]
    locations: LocationRecord[]
    categories: CategoryRecord[]
    businesses: BusinessRecord[]
    creators: CreatorRecord[]
    sessions: Record<string, string> // token -> user_id
}

const DB_PATH = path.join(process.cwd(), '.data', 'db.json')

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + '_goaconnect_salt').digest('hex')
}

function loadDB(): DatabaseSchema {
    try {
        if (!fs.existsSync(path.dirname(DB_PATH))) {
            fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
        }
        if (fs.existsSync(DB_PATH)) {
            const raw = fs.readFileSync(DB_PATH, 'utf-8')
            return JSON.parse(raw)
        }
    } catch {
        // Fallback to initial
    }

    const initial: DatabaseSchema = {
        users: [
            {
                user_id: 'usr-admin',
                email: 'admin@goaconnect.in',
                password_hash: hashPassword('admin123'),
                role: 'admin',
                is_verified: true,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                user_id: 'usr-rahul',
                email: 'rahul@goaconnect.in',
                password_hash: hashPassword('creator123'),
                role: 'creator',
                is_verified: true,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                user_id: 'usr-palmeira',
                email: 'palmeira@goaconnect.in',
                password_hash: hashPassword('business123'),
                role: 'business',
                is_verified: true,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ],
        locations: INITIAL_LOCATIONS,
        categories: INITIAL_CATEGORIES,
        businesses: [
            {
                business_id: 'biz-1',
                user_id: 'usr-palmeira',
                location_id: 'loc-2',
                business_name: 'Café Palmeira',
                industry: 'Food & Dining',
                description: 'Authentic Portuguese-Goan bistro in Calangute with artisan sourdough & coffee.',
                contact_phone: '+91 98221 44556',
                instagram_handle: '@cafepalmeiragoa',
            },
        ],
        creators: [
            {
                creator_id: 'cr-1',
                user_id: 'usr-rahul',
                location_id: 'loc-1',
                full_name: 'Rahul Naik',
                bio: 'Documenting Goan tavernas, Portuguese bakeries, and coastal culinary bars.',
                accepts_barter: true,
                min_paid_rate: 8500,
                created_at: new Date().toISOString(),
            },
        ],
        sessions: {},
    }

    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2))
    } catch {
        // Ignore write failures in read-only sandbox
    }

    return initial
}

function saveDB(db: DatabaseSchema) {
    try {
        if (!fs.existsSync(path.dirname(DB_PATH))) {
            fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
        }
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
    } catch {
        // Ignore write failure
    }
}

export async function registerUser(data: {
    email: string
    password: string
    role: 'business' | 'creator'
    businessData?: {
        business_name: string
        industry: string
        location_id: string
        description?: string
        contact_phone: string
        instagram_handle: string
        website_url?: string
    }
    creatorData?: {
        full_name: string
        location_id: string
        bio?: string
        category_id?: string
        accepts_barter: boolean
        min_paid_rate: number
        instagram_handle?: string
    }
}) {
    const db = loadDB()
    const emailLower = data.email.trim().toLowerCase()

    const existing = db.users.find((u) => u.email.toLowerCase() === emailLower)
    if (existing) {
        throw new Error('An account with this email already exists.')
    }

    const userId = `usr-${crypto.randomUUID().slice(0, 8)}`
    const now = new Date().toISOString()

    const newUser: UserRecord = {
        user_id: userId,
        email: emailLower,
        password_hash: hashPassword(data.password),
        role: data.role,
        is_verified: false,
        is_active: true,
        created_at: now,
        updated_at: now,
    }

    db.users.push(newUser)

    if (data.role === 'business' && data.businessData) {
        const biz: BusinessRecord = {
            business_id: `biz-${crypto.randomUUID().slice(0, 8)}`,
            user_id: userId,
            location_id: data.businessData.location_id,
            business_name: data.businessData.business_name,
            industry: data.businessData.industry,
            description: data.businessData.description || '',
            contact_phone: data.businessData.contact_phone,
            instagram_handle: data.businessData.instagram_handle,
            website_url: data.businessData.website_url || '',
        }
        db.businesses.push(biz)
    } else if (data.role === 'creator' && data.creatorData) {
        const cr: CreatorRecord = {
            creator_id: `cr-${crypto.randomUUID().slice(0, 8)}`,
            user_id: userId,
            location_id: data.creatorData.location_id,
            full_name: data.creatorData.full_name,
            bio: data.creatorData.bio || '',
            accepts_barter: Boolean(data.creatorData.accepts_barter),
            min_paid_rate: Number(data.creatorData.min_paid_rate) || 0,
            created_at: now,
        }
        db.creators.push(cr)
    }

    // Generate session token
    const token = crypto.randomUUID()
    db.sessions[token] = userId
    saveDB(db)

    return { user: sanitizeUser(newUser), token }
}

export async function loginUser(email: string, password: string) {
    const db = loadDB()
    const emailLower = email.trim().toLowerCase()
    const hash = hashPassword(password)

    const user = db.users.find(
        (u) => u.email.toLowerCase() === emailLower && u.password_hash === hash
    )

    if (!user) {
        throw new Error('Invalid email or password.')
    }

    if (!user.is_active) {
        throw new Error('Your account has been deactivated. Please contact support.')
    }

    const token = crypto.randomUUID()
    db.sessions[token] = user.user_id
    saveDB(db)

    let profile: BusinessRecord | CreatorRecord | null = null
    if (user.role === 'business') {
        profile = db.businesses.find((b) => b.user_id === user.user_id) || null
    } else if (user.role === 'creator') {
        profile = db.creators.find((c) => c.user_id === user.user_id) || null
    }

    return {
        user: sanitizeUser(user),
        profile,
        token,
    }
}

export async function getSessionUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('goa_session')?.value
    if (!token) return null

    const db = loadDB()
    const userId = db.sessions[token]
    if (!userId) return null

    const user = db.users.find((u) => u.user_id === userId)
    if (!user || !user.is_active) return null

    let profile: BusinessRecord | CreatorRecord | null = null
    if (user.role === 'business') {
        profile = db.businesses.find((b) => b.user_id === user.user_id) || null
    } else if (user.role === 'creator') {
        profile = db.creators.find((c) => c.user_id === user.user_id) || null
    }

    return {
        user: sanitizeUser(user),
        profile,
    }
}

export async function logoutUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('goa_session')?.value
    if (token) {
        const db = loadDB()
        delete db.sessions[token]
        saveDB(db)
    }
}

function sanitizeUser(user: UserRecord) {
    const { password_hash, ...rest } = user
    void password_hash
    return rest
}
