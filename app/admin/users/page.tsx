'use client'

import { useCallback, useEffect, useState } from 'react'
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    Search,
    ShieldCheck,
    Trash2,
    Users,
    X,
} from 'lucide-react'

interface AdminUser {
    user_id: number
    email: string
    role: string
    is_verified: boolean
    created_at: string
    creator_name?: string
    business_name?: string
    area_name?: string
    taluka?: string
    district?: string
    handle?: string
}

interface Pagination {
    page: number
    totalPages: number
    total: number
    hasNext: boolean
    hasPrev: boolean
}

function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    danger,
}: {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    danger?: boolean
}) {
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
                <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-foreground">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
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
                        onClick={onConfirm}
                        className={`flex-1 text-xs font-semibold px-4 py-2 cursor-pointer transition-colors ${
                            danger
                                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    const [q, setQ] = useState('')
    const [role, setRole] = useState('all')
    const [verified, setVerified] = useState('')
    const [page, setPage] = useState(1)

    const [confirm, setConfirm] = useState<{
        open: boolean
        type: 'verify' | 'unverify' | 'delete'
        userId: number
        userName: string
    } | null>(null)

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg })
        setTimeout(() => setToast(null), 3500)
    }

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({ page: String(page), limit: '20' })
        if (q) params.set('q', q)
        if (role && role !== 'all') params.set('role', role)
        if (verified !== '') params.set('verified', verified)

        try {
            const res = await fetch(`/api/admin/users?${params}`)
            const data = await res.json()
            if (data.success) {
                setUsers(data.data || [])
                setPagination(data.pagination || null)
            } else {
                setError(data.error || 'Failed to load users')
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Network error')
        } finally {
            setLoading(false)
        }
    }, [q, role, verified, page])

    useEffect(() => { load() }, [load])

    const handleAction = async () => {
        if (!confirm) return
        const { type, userId, userName } = confirm
        setConfirm(null)

        try {
            let res: Response
            if (type === 'delete') {
                res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
            } else {
                res = await fetch(`/api/admin/users/${userId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_verified: type === 'verify' }),
                })
            }
            const data = await res.json()
            if (res.ok && data.success) {
                showToast(
                    'success',
                    type === 'delete'
                        ? `${userName} deleted.`
                        : `${userName} ${type === 'verify' ? 'verified' : 'unverified'}.`
                )
                await load()
            } else {
                showToast('error', data.error || 'Action failed')
            }
        } catch (e) {
            showToast('error', e instanceof Error ? e.message : 'Error')
        }
    }

    const displayName = (u: AdminUser) =>
        u.creator_name || u.business_name || u.email.split('@')[0]

    return (
        <main className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <Users className="size-3" />
                        USER MANAGEMENT
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Users</h1>
                <p className="text-sm text-muted-foreground">
                    Search, filter, verify, and manage platform users.
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

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center flex-1 min-w-48 max-w-80">
                    <Search className="absolute left-3 size-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        value={q}
                        onChange={(e) => { setQ(e.target.value); setPage(1) }}
                        placeholder="Search by name, email, taluka…"
                        className="w-full border border-border bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <select
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setPage(1) }}
                    className="border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                    <option value="all">All Roles</option>
                    <option value="creator">Creator</option>
                    <option value="business">Business</option>
                    <option value="admin">Admin</option>
                </select>
                <select
                    value={verified}
                    onChange={(e) => { setVerified(e.target.value); setPage(1) }}
                    className="border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                    <option value="">All Status</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                </select>
                <button
                    type="button"
                    onClick={() => { setQ(''); setRole('all'); setVerified(''); setPage(1) }}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground border border-border bg-background px-3 py-2 hover:bg-muted cursor-pointer transition-colors"
                >
                    Clear
                </button>
                {pagination && (
                    <span className="ml-auto text-xs text-muted-foreground">
                        {pagination.total} users
                    </span>
                )}
            </div>

            {/* Table Card */}
            <div className="border border-border bg-card">
                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-3">
                        <Loader2 className="size-6 text-primary animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading users…</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <AlertCircle className="size-6 text-destructive" />
                        <p className="text-sm text-destructive font-semibold">{error}</p>
                        <button onClick={load} className="text-xs font-bold text-primary hover:underline">
                            Retry
                        </button>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-border m-6">
                        <Users className="size-8 text-muted-foreground" />
                        <p className="text-sm font-semibold text-foreground">No users found</p>
                        <p className="text-xs text-muted-foreground">
                            Try adjusting your search or filter criteria.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border text-muted-foreground">
                                    <th className="py-2.5 px-4 font-semibold">Name / Email</th>
                                    <th className="py-2.5 px-4 font-semibold">Role</th>
                                    <th className="py-2.5 px-4 font-semibold">Location</th>
                                    <th className="py-2.5 px-4 font-semibold">Joined</th>
                                    <th className="py-2.5 px-4 font-semibold">Status</th>
                                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((u) => (
                                    <tr key={u.user_id} className="hover:bg-muted/30">
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-foreground">
                                                {displayName(u)}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {u.email}
                                                {u.handle && (
                                                    <span className="ml-1.5 text-primary">@{u.handle}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="capitalize font-medium text-foreground">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">
                                            {u.taluka ? `${u.taluka}, ${u.district}` : '—'}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">
                                            {new Date(u.created_at).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: '2-digit',
                                            })}
                                        </td>
                                        <td className="py-3 px-4">
                                            {u.is_verified ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary">
                                                    <ShieldCheck className="size-3" /> VERIFIED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-muted border border-border text-muted-foreground">
                                                    UNVERIFIED
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {u.role !== 'admin' && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setConfirm({
                                                                open: true,
                                                                type: u.is_verified ? 'unverify' : 'verify',
                                                                userId: u.user_id,
                                                                userName: displayName(u),
                                                            })
                                                        }
                                                        className="border border-border bg-background text-foreground text-xs font-semibold px-3 py-1.5 hover:bg-muted cursor-pointer transition-colors"
                                                    >
                                                        {u.is_verified ? 'Unverify' : 'Verify'}
                                                    </button>
                                                )}
                                                {u.role !== 'admin' && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setConfirm({
                                                                open: true,
                                                                type: 'delete',
                                                                userId: u.user_id,
                                                                userName: displayName(u),
                                                            })
                                                        }
                                                        className="size-7 flex items-center justify-center border border-destructive/30 text-destructive hover:bg-destructive/5 cursor-pointer transition-colors"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={!pagination.hasPrev}
                                onClick={() => setPage((p) => p - 1)}
                                className="border border-border bg-background text-xs font-semibold px-3 py-1.5 hover:bg-muted cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ← Prev
                            </button>
                            <button
                                type="button"
                                disabled={!pagination.hasNext}
                                onClick={() => setPage((p) => p + 1)}
                                className="border border-border bg-background text-xs font-semibold px-3 py-1.5 hover:bg-muted cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            {confirm && (
                <ConfirmDialog
                    open={confirm.open}
                    onClose={() => setConfirm(null)}
                    onConfirm={handleAction}
                    danger={confirm.type === 'delete'}
                    title={
                        confirm.type === 'delete'
                            ? `Delete ${confirm.userName}?`
                            : confirm.type === 'verify'
                            ? `Verify ${confirm.userName}?`
                            : `Unverify ${confirm.userName}?`
                    }
                    description={
                        confirm.type === 'delete'
                            ? `This will permanently delete the user and all their data. This action cannot be undone.`
                            : confirm.type === 'verify'
                            ? `This will mark ${confirm.userName} as verified on the platform.`
                            : `This will remove the verified status from ${confirm.userName}.`
                    }
                />
            )}
        </main>
    )
}

