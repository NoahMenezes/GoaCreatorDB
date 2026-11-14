export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'
import { requireAuth, saveAndClose } from '@/lib/api-auth'

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth

  const db = await initDb()
  try {
    const accounts = db
      .query('SELECT * FROM social_accounts WHERE user_id = ?')
      .all(auth.user.user_id) as unknown as { account_id: string }[]

    const result: unknown[] = []
    for (const account of accounts) {
      const latestMetric = db
        .query(
          'SELECT * FROM social_metrics WHERE account_id = ? ORDER BY recorded_at DESC LIMIT 1'
        )
        .get(account.account_id) as unknown as { followers: number } | null

      result.push({
        ...account,
        metrics: latestMetric || null,
      })
    }

    saveAndClose(db)
    return NextResponse.json({ success: true, data: result })
  } catch {
    saveAndClose(db)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social metrics' },
      { status: 500 }
    )
  }
}
