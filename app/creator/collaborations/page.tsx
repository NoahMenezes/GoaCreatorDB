'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ShieldCheck, AlertCircle, RefreshCw, Loader2, MessageSquare } from 'lucide-react'

interface CollaborationItem {
    request_id: number
    business_id: number
    business_name: string
    creator_id: number
    creator_name: string
    business_area: string
    business_taluka: string
    creator_area: string
    creator_taluka: string
    collab_type: 'paid' | 'barter' | 'hybrid'
    offered_amount: number
    offer_details: string
    deliverables: string | null
    message: string | null
    status: 'accepted' | 'completed'
    requested_at: string
    responded_at: string | null
    deadline: string
}

export default function CreatorCollaborationsPage() {
    const [collaborations, setCollaborations] = useState<CollaborationItem[]>([])
    const [filter, setFilter] = useState<'all' | 'accepted' | 'completed'>('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedCollab, setSelectedCollab] = useState<CollaborationItem | null>(null)

    const loadCollaborations = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/collaborations?status=${filter === 'all' ? '' : filter}`, {
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to load collaborations')
            }
            setCollaborations(data.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Collaborations load error')
        } finally {
            setLoading(false)
        }
    }, [filter])

    useEffect(() => {
        loadCollaborations()
    }, [loadCollaborations])

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    const counts = {
        all: collaborations.length,
        accepted: collaborations.filter((c) => c.status === 'accepted').length,
        completed: collaborations.filter((c) => c.status === 'completed').length,
    }

    const tabs = [
        { id: 'all', label: `All (${counts.all})` },
        { id: 'accepted', label: `In Progress / Accepted (${counts.accepted})` },
        { id: 'completed', label: `Completed (${counts.completed})` },
    ] as const

    const filtered = filter === 'all' ? collaborations : collaborations.filter((c) => c.status === filter)

    return (
        <main className="space-y-8">
            <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                        Collaborations
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your active and completed collaborations, track deliverables, and deadlines.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilter(tab.id)}
                        className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer rounded-sm border ${
                            filter === tab.id
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="border border-border bg-card p-12 text-center rounded-sm shadow-sm flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="size-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading collaborations...</p>
                    </div>
                ) : error ? (
                    <div className="border border-destructive/20 bg-destructive/5 p-6 rounded-sm text-center space-y-3">
                        <AlertCircle className="size-8 text-destructive mx-auto" />
                        <p className="text-sm font-semibold text-destructive">{error}</p>
                        <button
                            type="button"
                            onClick={loadCollaborations}
                            className="inline-flex items-center gap-2 bg-background border border-border px-4 py-2 text-xs font-bold hover:bg-muted rounded-sm transition-colors cursor-pointer"
                        >
                            <RefreshCw className="size-3.5" />
                            <span>Try Again</span>
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="border border-border bg-muted/30 p-12 rounded-sm text-center space-y-3">
                        <ShieldCheck className="size-10 text-muted-foreground mx-auto stroke-1" />
                        <h3 className="text-base font-bold text-foreground">No collaborations found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            {filter === 'all'
                                ? 'Accepted and completed brand collaborations will appear here.'
                                : `No collaborations with status "${filter}".`}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Campaign</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Business</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Compensation</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deadline</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deliverables</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map((col) => (
                                    <tr key={col.request_id} className="hover:bg-muted/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 object-cover rounded-md border border-border/60 bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground shrink-0">
                                                    {getInitials(col.business_name)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold text-foreground truncate max-w-xs">
                                                        {col.offer_details || `Collaboration REQ-${col.request_id}`}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate">
                                                        Requested {new Date(col.requested_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-foreground font-medium">
                                            <div>{col.business_name}</div>
                                            <div className="text-[10px] text-muted-foreground">{col.business_area || 'Goa'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm border ${
                                                    col.status === 'completed'
                                                        ? 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                                                        : 'border-primary/20 text-primary bg-primary/5'
                                                }`}
                                            >
                                                {col.status === 'accepted' ? 'In Progress' : 'Completed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-foreground font-medium">
                                            {col.collab_type === 'barter'
                                                ? 'Barter Deal'
                                                : `₹${Number(col.offered_amount || 0).toLocaleString()}${col.collab_type === 'hybrid' ? ' + Barter' : ''}`}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground">
                                            {new Date(col.deadline).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-[150px]">
                                                {col.deliverables || 'Content delivery'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/creator/requests/${col.request_id}`}
                                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                <span>Details</span>
                                                <ChevronRight className="size-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Collaboration details dialog */}
            {selectedCollab && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-card border border-border p-6 rounded-sm shadow-xl max-w-lg w-full space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <MessageSquare className="size-4 text-primary" />
                                <span>Collaboration Overview</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedCollab(null)}
                                className="text-muted-foreground hover:text-foreground text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-muted-foreground text-[10px] uppercase font-bold block">Business Partner</span>
                                <span className="font-semibold text-foreground text-base">{selectedCollab.business_name}</span>
                                <span className="text-xs text-muted-foreground block">{selectedCollab.business_area}, {selectedCollab.business_taluka}</span>
                            </div>

                            <div>
                                <span className="text-muted-foreground text-[10px] uppercase font-bold block">Campaign Offer</span>
                                <p className="text-xs text-foreground font-medium">{selectedCollab.offer_details || 'Standard Campaign'}</p>
                            </div>

                            {selectedCollab.deliverables && (
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Agreed Deliverables</span>
                                    <p className="text-xs text-foreground bg-muted/40 p-2.5 rounded-sm border border-border">
                                        {selectedCollab.deliverables}
                                    </p>
                                </div>
                            )}

                            {selectedCollab.message && (
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Brief Message</span>
                                    <p className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-2">
                                        &ldquo;{selectedCollab.message}&rdquo;
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Status</span>
                                    <span className="font-bold text-foreground capitalize">
                                        {selectedCollab.status === 'accepted' ? 'In Progress' : 'Completed'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Agreed Amount</span>
                                    <span className="font-bold text-primary">
                                        {selectedCollab.collab_type === 'barter'
                                            ? 'Barter'
                                            : `₹${Number(selectedCollab.offered_amount || 0).toLocaleString()}`}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Deadline</span>
                                    <span className="font-semibold text-foreground">
                                        {new Date(selectedCollab.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold block">Accepted At</span>
                                    <span className="font-semibold text-foreground">
                                        {selectedCollab.responded_at ? new Date(selectedCollab.responded_at).toLocaleDateString() : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedCollab(null)}
                                className="bg-primary text-primary-foreground font-medium text-xs px-4 py-2 rounded-sm cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
