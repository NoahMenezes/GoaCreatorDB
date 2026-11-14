export const dynamic = 'force-dynamic'
import { PATCH as patchHandler, DELETE as deleteHandler } from '../route'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const body = await request.json().catch(() => ({}))
  const mergedBody = { ...body, user_id: resolvedParams.id }

  const proxyReq = new Request(request.url, {
    method: 'PATCH',
    headers: request.headers,
    body: JSON.stringify(mergedBody),
  })

  return patchHandler(proxyReq)
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

