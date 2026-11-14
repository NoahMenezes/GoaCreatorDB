export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

// reels table was dropped per docs/backend-audit.md §1a & §7 (UI grid hidden)
export async function GET() {
  return NextResponse.json({
    success: true,
    total: 0,
    source: 'GoaConnect Verified Reels Engine',
    data: [],
  })
}
