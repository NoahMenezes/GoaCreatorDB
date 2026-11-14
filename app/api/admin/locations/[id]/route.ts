export const dynamic = 'force-dynamic'
import { PUT as putHandler, DELETE as deleteHandler } from '../route'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const body = await request.json().catch(() => ({}))
  const mergedBody = { ...body, location_id: resolvedParams.id }

  const proxyReq = new Request(request.url, {
    method: 'PUT',
    headers: request.headers,
    body: JSON.stringify(mergedBody),
  })

  return putHandler(proxyReq)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const url = new URL(request.url)
  url.searchParams.set('id', resolvedParams.id)

  const proxyReq = new Request(url.toString(), {
    method: 'DELETE',
    headers: request.headers,
  })

  return deleteHandler(proxyReq)
}

