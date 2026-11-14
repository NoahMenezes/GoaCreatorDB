'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Calendar, Star, MapPin, ChevronRight } from 'lucide-react'

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    in_production: 'In Production',
    submitted: 'Submitted',
    completed: 'Completed',
    cancelled: 'Cancelled',
}

export default function CreatorCollaborationsPage() {
    const [collaborations, setCollaborations] = useState<any[]>([])
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'in_production' | 'submitted' | 'completed' | 'cancelled'>('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadCollaborations()
    }, [filter])

    const loadCollaborations = async () => {
        try {
            const res = await fetch(`/api/collaborations?status=${filter === 'all' ? '' : filter}`, {
                credentials: 'include',
            })
            if (res.ok) {
                const data = await res.json()
                setCollaborations(data.data || [])
            }
        } catch (err) {
            console.error('Collaborations load error:', err)
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'all', label: `All (${collaborations.length})` },
        { id: 'pending', label: `Pending (${collaborations.filter(c => c.status === 'pending').length})` },
        { id: 'accepted', label: `Accepted (${collaborations.filter(c => c.status === 'accepted').length})` },
        { id: 'in_production', label: `In Production (${collaborations.filter(c => c.status === 'in_production').length})` },
        { id: 'completed', label: `Completed (${collaborations.filter(c => c.status === 'completed').length})` },
    ]

    const filtered = filter === 'all' ? collaborations : collaborations.filter(c => c.status === filter)

    return (
        <main className="space-y-8">
            <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                        Collaborations
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your accepted collaborations, track deliverables, deadlines, and payments.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilter(tab.id as any)}
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
                    <div className="flex items-center justify-center py-12">
                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="border border-border bg-muted/30 p-12 rounded-sm text-center">
                        <p className="text-sm text-muted-foreground">No collaborations found.</p>
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
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map((c) => (
                                    <tr key={c.collaboration_id} className="hover:bg-muted/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=200&auto=format&fit=crop"
                                                    alt={c.business_name || 'Business'}
                                                    width={36}
                                                    height={36}
                                                    className="size-10 object-cover rounded-md border border-border/60"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold text-foreground truncate">
                                                        {c.campaign_title || c.title}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate">
                                                        {c.objective?.slice(0, 60)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-foreground font-medium">
                                            {c.business_name || c.business_email?.split('@')[0] || 'Business'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm border ${
                                                c.status === 'completed'
                                                    ? 'border-primary/20 text-primary bg-primary/5'
                                                    : c.status === 'in_production'
                                                    ? 'border-primary/20 text-primary bg-primary/5'
                                                    : c.status === 'accepted'
                                                    ? 'border-primary/20 text-primary bg-primary/5'
                                                    : 'border-border text-muted-foreground bg-background'
                                            }`}>
                                                {statusLabels[c.status] || c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-foreground">
                                            ₹{c.payment_amount}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground">
                                            {c.deadline || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold ${c.payment_status === 'paid' ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {c.payment_status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/creator/collaborations?id=${c.collaboration_id}`}
                                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
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
        </main>
    )
}
