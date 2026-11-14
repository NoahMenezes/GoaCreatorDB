import { RequestDetailView } from '@/components/requests/request-detail-view'

export default async function BusinessRequestDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params
    return <RequestDetailView requestId={resolvedParams.id} backHref="/business/requests" />
}

