export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { POST as postVerificationHandler } from '../route'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const body = await request.json().catch(() => ({}))
  const mergedBody = { ...body, id: resolvedParams.id }

  const proxyReq = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(mergedBody),
  })

  return postVerificationHandler(proxyReq)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params })
}

