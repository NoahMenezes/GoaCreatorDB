'use client'

import { useCallback, useEffect, useState } from 'react'
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    ShieldAlert,
    ShieldCheck,
    X,
} from 'lucide-react'

interface UnverifiedAccount {
    user_id: number
    email: string
    role: string
    name: string
    handle?: string
    district?: string
    taluka?: string
    trust_score: number
    risk_label: string
    is_verified: boolean
    submitted_at?: string
}

interface UnverifiedMetric {
    metric_id: number
    account_id: number
    platform: string
    handle: string
    creator_name: string
    follower_count: number
    engagement_rate: number
    data_source: string
    submitted_at?: string
}

type TabKey = 'accounts' | 'metrics'

function TrustBadge({ label }: { label: string }) {
    const riskLabel = (label || 'LOW').toUpperCase()
    if (riskLabel === 'LOW')
        return (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-primary/30 bg-primary/10 text-primary">
                LOW
            </span>
        )
    if (riskLabel === 'MEDIUM')
        return (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-warning/30 bg-warning/10 text-warning">
                MEDIUM
            </span>
        )
    return (
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-destructive/30 bg-destructive/10 text-destructive">
            HIGH
        </span>
    )
}

function NoteDialog({
    open,
    onClose,
    onConfirm,
    action,
    name,
}: {
    open: boolean
    onClose: () => void
    onConfirm: (note: string) => void
    action: 'approve' | 'reject'
    name: string
}) {
    const [note, setNote] = useState('')
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="relative w-full max-w-sm border border-border bg-card p-6 shadow-2xl space-y-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 size-7 flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                    <X className="size-4" />
                </button>
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">
                        {action === 'approve' ? 'Approve' : 'Reject'} Verification
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {action === 'approve' ? 'Approving' : 'Rejecting'}{' '}
                        <span className="font-semibold text-foreground">{name}</span>
                        {action === 'reject' && '. Add an optional note for the audit log.'}
                    </p>
                </div>
                {action === 'reject' && (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                            Note (optional)
                        </label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Reason for rejection…"
                            className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                    </div>
                )}
                <div className="flex gap-2 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 border border-border bg-background text-foreground text-xs font-semibold px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => { onConfirm(note); setNote('') }}
                        className={`flex-1 text-xs font-semibold px-4 py-2 cursor-pointer transition-colors ${
                            action === 'approve'
                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                        }`}
                    >
                        {action === 'approve' ? 'Approve' : 'Reject'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function VerificationsPage() {
    const [tab, setTab] = useState<TabKey>('accounts')
    const [accounts, setAccounts] = useState<UnverifiedAccount[]>([])
    const [metrics, setMetrics] = useState<UnverifiedMetric[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    // Dialog state
    const [dialog, setDialog] = useState<{
        open: boolean
        action: 'approve' | 'reject'
        type: 'accounts' | 'metrics'
        id: number
        name: string
    } | null>(null)

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg })
        setTimeout(() => setToast(null), 3500)
    }

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [accRes, metRes] = await Promise.all([
                fetch('/api/admin/verifications?type=accounts'),
                fetch('/api/admin/verifications?type=metrics'),
            ])
            const [accData, metData] = await Promise.all([accRes.json(), metRes.json()])
            if (accData.success) setAccounts(accData.data || [])
            if (metData.success) setMetrics(metData.data || [])
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load verifications')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleAction = async (note: string) => {
        if (!dialog) return
        const { action, type, id, name } = dialog
        setDialog(null)
        try {
            const res = await fetch('/api/admin/verifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id, action, note }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                showToast('success', `${name} ${action === 'approve' ? 'approved' : 'rejected'} successfully.`)
                await load()
            } else {
                showToast('error', data.error || `Failed to ${action}`)
            }
        } catch (e) {
            showToast('error', e instanceof Error ? e.message : 'Error processing action')
        }
    }

    const openDialog = (
        action: 'approve' | 'reject',
        type: 'accounts' | 'metrics',
        id: number,
        name: string
    ) => setDialog({ open: true, action, type, id, name })

    return (
        <main className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <ShieldCheck className="size-3" />
                        VERIFICATIONS
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    Verification Queue
                </h1>
                <p className="text-sm text-muted-foreground">
                    Review and certify pending accounts and self-reported creator metrics.
                </p>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`flex items-center gap-2 p-3 border text-xs font-semibold ${
                        toast.type === 'success'
                            ? 'bg-primary/5 border-primary/20 text-primary'
                            : 'bg-destructive/5 border-destructive/20 text-destructive'
                    }`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle2 className="size-4" />
                    ) : (
                        <AlertCircle className="size-4" />
                    )}
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Tabs + Table Card */}
            <div className="border border-border bg-card">
                {/* Tab bar */}
                <div className="flex items-center gap-0 border-b border-border px-5 pt-4">
                    {(
                        [
                            { key: 'accounts' as TabKey, label: `Accounts`, count: accounts.length },
                            { key: 'metrics' as TabKey, label: `Metrics`, count: metrics.length },
                        ] as const
                    ).map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                                tab === t.key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t.label}
                            <span
                                className={`ml-1.5 px-1.5 py-0.5 text-[9px] font-bold ${
                                    t.count > 0
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-muted text-muted-foreground border border-border'
                                }`}
                            >
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 gap-3">
                            <Loader2 className="size-6 text-primary animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading queue…</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <AlertCircle className="size-6 text-destructive" />
                            <p className="text-sm text-destructive font-semibold">{error}</p>
                            <button onClick={load} className="text-xs font-bold text-primary hover:underline">
                                Retry
                            </button>
                        </div>
                    ) : tab === 'accounts' ? (
                        accounts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-border">
                                <ShieldCheck className="size-8 text-primary" />
                                <p className="text-sm font-semibold text-foreground">All accounts verified</p>
                                <p className="text-xs text-muted-foreground">
                                    No pending account verifications in the queue.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-border text-muted-foreground">
                                            <th className="py-2.5 px-3 font-semibold">Name / Email</th>
                                            <th className="py-2.5 px-3 font-semibold">Type</th>
                                            <th className="py-2.5 px-3 font-semibold">Location</th>
                                            <th className="py-2.5 px-3 font-semibold">Submitted</th>
                                            <th className="py-2.5 px-3 font-semibold">Trust Score</th>
                                            <th className="py-2.5 px-3 font-semibold">Risk</th>
                                            <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {accounts.map((acc) => (
                                            <tr key={acc.user_id} className="hover:bg-muted/30">
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold text-foreground">
                                                        {acc.name || 'Anonymous User'}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {acc.email}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 capitalize font-medium text-foreground">
                                                    {acc.role}
                                                </td>
                                                <td className="py-3 px-3 text-muted-foreground">
                                                    {acc.taluka ? `${acc.taluka}, ${acc.district}` : 'Goa'}
                                                </td>
                                                <td className="py-3 px-3 text-muted-foreground">
                                                    {acc.submitted_at
                                                        ? new Date(acc.submitted_at).toLocaleDateString('en-IN')
                                                        : '—'}
                                                </td>
                                                <td className="py-3 px-3 font-bold text-foreground">
                                                    {acc.trust_score ?? 50}/100
                                                </td>
                                                <td className="py-3 px-3">
                                                    <TrustBadge label={acc.risk_label || 'LOW'} />
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDialog(
                                                                    'approve',
                                                                    'accounts',
                                                                    acc.user_id,
                                                                    acc.name || acc.email
                                                                )
                                                            }
                                                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 cursor-pointer transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDialog(
                                                                    'reject',
                                                                    'accounts',
                                                                    acc.user_id,
                                                                    acc.name || acc.email
                                                                )
                                                            }
                                                            className="bg-background border border-destructive/40 text-destructive hover:bg-destructive/5 text-xs font-semibold px-3 py-1.5 cursor-pointer transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : // Metrics tab
                    metrics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-border">
                            <ShieldAlert className="size-8 text-primary" />
                            <p className="text-sm font-semibold text-foreground">No pending metric snapshots</p>
                            <p className="text-xs text-muted-foreground">
                                All self-reported metrics have been reviewed.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border text-muted-foreground">
                                        <th className="py-2.5 px-3 font-semibold">Creator</th>
                                        <th className="py-2.5 px-3 font-semibold">Platform & Handle</th>
                                        <th className="py-2.5 px-3 font-semibold">Followers</th>
                                        <th className="py-2.5 px-3 font-semibold">Engagement</th>
                                        <th className="py-2.5 px-3 font-semibold">Source</th>
                                        <th className="py-2.5 px-3 font-semibold">Submitted</th>
                                        <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {metrics.map((met) => (
                                        <tr key={met.metric_id} className="hover:bg-muted/30">
                                            <td className="py-3 px-3 font-semibold text-foreground">
                                                {met.creator_name}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="capitalize font-medium text-foreground">
                                                    {met.platform}
                                                </span>
                                                <span className="text-muted-foreground"> ({met.handle})</span>
                                            </td>
                                            <td className="py-3 px-3 font-bold text-foreground">
                                                {Number(met.follower_count).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-3">
                                                {Number(met.engagement_rate).toFixed(2)}%
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-warning/10 border border-warning/20 text-warning">
                                                    {met.data_source}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-muted-foreground">
                                                {met.submitted_at
                                                    ? new Date(met.submitted_at).toLocaleDateString('en-IN')
                                                    : '—'}
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDialog(
                                                                'approve',
                                                                'metrics',
                                                                met.metric_id,
                                                                met.creator_name
                                                            )
                                                        }
                                                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 cursor-pointer transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDialog(
                                                                'reject',
                                                                'metrics',
                                                                met.metric_id,
                                                                met.creator_name
                                                            )
                                                        }
                                                        className="bg-background border border-destructive/40 text-destructive hover:bg-destructive/5 text-xs font-semibold px-3 py-1.5 cursor-pointer transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Note Dialog */}
            {dialog && (
                <NoteDialog
                    open={dialog.open}
                    onClose={() => setDialog(null)}
                    onConfirm={handleAction}
                    action={dialog.action}
                    name={dialog.name}
                />
            )}
        </main>
    )
}

