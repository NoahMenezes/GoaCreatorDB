'use client'

import { useState, useEffect } from 'react'
import {
    AlertCircle,
    Download,
    FileText,
    Loader2,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReportSummary {
    total_requests: number
    completed_deals: number
    offered_amount_of_completed_deals: number
}

interface MonthlyRow {
    month: string
    total_requests: number
    completed_deals: number
    accepted_deals: number
    rejected_deals: number
    cancelled_deals: number
    offered_amount_of_completed_deals: number
}

interface CategoryRow {
    category_name: string
    total_requests: number
    completed_deals: number
    offered_amount_of_completed_deals: number
}

interface TalukaRow {
    taluka: string
    district: string
    total_requests: number
    completed_deals: number
    offered_amount_of_completed_deals: number
}

interface CollabTypeRow {
    collab_type: string
    total_requests: number
    completed_deals: number
    offered_amount_of_completed_deals: number
}

interface StatusRow {
    status: string
    total_requests: number
    pct: number
}

interface ReportData {
    summary: ReportSummary
    monthly_velocity: MonthlyRow[]
    category_breakdown: CategoryRow[]
    taluka_breakdown: TalukaRow[]
    collab_type_breakdown: CollabTypeRow[]
    status_breakdown: StatusRow[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
    return (
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
            <div>
                <div className="text-xs font-bold text-foreground">{title}</div>
                {sub && <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{sub}</div>}
            </div>
        </div>
    )
}

function fmt(n: number) {
    return Number(n).toLocaleString('en-IN')
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
    const today = new Date()
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setMonth(today.getMonth() - 6)

    const toIsoDate = (d: Date) => d.toISOString().split('T')[0]

    const [from, setFrom] = useState(toIsoDate(sixMonthsAgo))
    const [to, setTo] = useState(toIsoDate(today))
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [exporting, setExporting] = useState(false)

    const load = async (fromDate: string, toDate: string) => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({ from: fromDate, to: toDate })
            const res = await fetch(`/api/admin/reports?${params}`)
            const json = await res.json()
            if (json.success) setData(json.data)
            else setError(json.error || 'Failed to load report data')
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Network error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load(from, to) }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleApply = () => load(from, to)

    const handleExport = async () => {
        setExporting(true)
        try {
            const params = new URLSearchParams({ from, to, format: 'csv' })
            const res = await fetch(`/api/admin/reports?${params}`)
            if (!res.ok) throw new Error('Export failed')
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `goaconnect-report-${from}-to-${to}.csv`
            a.click()
            URL.revokeObjectURL(url)
        } catch (e) {
            console.error('Export failed:', e)
        } finally {
            setExporting(false)
        }
    }

    const maxMonthly = Math.max(...(data?.monthly_velocity ?? []).map((r) => r.total_requests), 1)

    return (
        <main className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <FileText className="size-3" />
                        REPORTS
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    Platform Reports
                </h1>
                <p className="text-sm text-muted-foreground">
                    Date-range analytics, breakdowns, and CSV export.
                </p>
            </div>

            {/* Controls */}
            <div className="border border-border bg-card p-5 flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">From</label>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">To</label>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleApply}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-2 cursor-pointer transition-colors"
                >
                    Apply
                </button>
                <div className="flex-1" />
                <button
                    type="button"
                    onClick={handleExport}
                    disabled={exporting || loading || !!error}
                    className="flex items-center gap-2 border border-border bg-background text-foreground text-xs font-semibold px-4 py-2 hover:bg-muted cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {exporting ? (
                        <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                        <Download className="size-3.5" />
                    )}
                    Export CSV
                </button>
            </div>

            {/* Loading / Error */}
            {loading ? (
                <div className="flex items-center justify-center py-24 gap-3">
                    <Loader2 className="size-7 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">Generating report…</span>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <AlertCircle className="size-7 text-destructive" />
                    <p className="text-sm text-destructive font-semibold">{error}</p>
                    <button
                        onClick={handleApply}
                        className="text-xs font-bold text-primary hover:underline"
                    >
                        Retry
                    </button>
                </div>
            ) : !data ? null : (
                <div className="space-y-6">
                    {/* Summary KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            {
                                label: 'Total Requests',
                                value: fmt(data.summary.total_requests),
                                sub: 'In date range',
                            },
                            {
                                label: 'Completed Deals',
                                value: fmt(data.summary.completed_deals),
                                sub: 'Successfully closed',
                            },
                            {
                                label: 'Deal Volume',
                                value: `₹${fmt(data.summary.offered_amount_of_completed_deals)}`,
                                sub: 'Paid & hybrid completed',
                            },
                        ].map((kpi) => (
                            <div key={kpi.label} className="border border-border bg-card p-5">
                                <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                    {kpi.label}
                                </div>
                                <div className="text-2xl font-black text-foreground mt-2">{kpi.value}</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Monthly Volume */}
                    <div className="border border-border bg-card">
                        <SectionHeader
                            title="Monthly Request Volume"
                            sub="Requests and completed deals per month"
                        />
                        {data.monthly_velocity.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                No data in selected date range
                            </div>
                        ) : (
                            <>
                                {/* Bar chart */}
                                <div className="px-5 py-4">
                                    <div className="flex items-end gap-1.5 h-24">
                                        {data.monthly_velocity.map((row) => {
                                            const h = Math.max(4, Math.round((row.total_requests / maxMonthly) * 96))
                                            const hComp = Math.max(2, Math.round((row.completed_deals / maxMonthly) * 96))
                                            return (
                                                <div
                                                    key={row.month}
                                                    className="flex flex-col items-center gap-0.5 flex-1 min-w-0"
                                                    title={`${row.month}: ${row.total_requests} requests, ${row.completed_deals} completed`}
                                                >
                                                    <div className="relative w-full flex items-end justify-center gap-0.5" style={{ height: 96 }}>
                                                        <div
                                                            className="bg-primary/30 border border-primary/20 w-5"
                                                            style={{ height: h }}
                                                        />
                                                        <div
                                                            className="bg-primary w-5 border border-primary"
                                                            style={{ height: hComp }}
                                                        />
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                                                        {row.month.slice(5)}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-2.5 bg-primary/30 border border-primary/20" />
                                            <span>Total Requests</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-2.5 bg-primary border border-primary" />
                                            <span>Completed Deals</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Table */}
                                <div className="overflow-x-auto border-t border-border">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-border text-muted-foreground">
                                                <th className="py-2.5 px-4 font-semibold">Month</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Requests</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Completed</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Accepted</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Rejected</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Volume (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {data.monthly_velocity.map((row) => (
                                                <tr key={row.month} className="hover:bg-muted/30">
                                                    <td className="py-2.5 px-4 font-semibold text-foreground">{row.month}</td>
                                                    <td className="py-2.5 px-4 text-right">{fmt(row.total_requests)}</td>
                                                    <td className="py-2.5 px-4 text-right font-bold text-primary">{fmt(row.completed_deals)}</td>
                                                    <td className="py-2.5 px-4 text-right">{fmt(row.accepted_deals)}</td>
                                                    <td className="py-2.5 px-4 text-right text-destructive">{fmt(row.rejected_deals)}</td>
                                                    <td className="py-2.5 px-4 text-right font-bold">₹{fmt(row.offered_amount_of_completed_deals)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Breakdowns Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Category Breakdown */}
                        <div className="border border-border bg-card">
                            <SectionHeader title="By Category" sub="Request volume per niche" />
                            {data.category_breakdown.length === 0 ? (
                                <div className="p-8 text-center text-xs text-muted-foreground">No data</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-border text-muted-foreground">
                                                <th className="py-2.5 px-4 font-semibold">Category</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Requests</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Completed</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Volume (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {data.category_breakdown.map((row) => (
                                                <tr key={row.category_name} className="hover:bg-muted/30">
                                                    <td className="py-2.5 px-4 font-semibold text-foreground">{row.category_name}</td>
                                                    <td className="py-2.5 px-4 text-right">{fmt(row.total_requests)}</td>
                                                    <td className="py-2.5 px-4 text-right font-bold text-primary">{fmt(row.completed_deals)}</td>
                                                    <td className="py-2.5 px-4 text-right">₹{fmt(row.offered_amount_of_completed_deals)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Taluka Breakdown */}
                        <div className="border border-border bg-card">
                            <SectionHeader title="By Taluka" sub="Geographic distribution" />
                            {data.taluka_breakdown.length === 0 ? (
                                <div className="p-8 text-center text-xs text-muted-foreground">No data</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-border text-muted-foreground">
                                                <th className="py-2.5 px-4 font-semibold">Taluka</th>
                                                <th className="py-2.5 px-4 font-semibold">District</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Requests</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Completed</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {data.taluka_breakdown.map((row) => (
                                                <tr key={`${row.taluka}-${row.district}`} className="hover:bg-muted/30">
                                                    <td className="py-2.5 px-4 font-semibold text-foreground">{row.taluka}</td>
                                                    <td className="py-2.5 px-4 text-muted-foreground">{row.district}</td>
                                                    <td className="py-2.5 px-4 text-right">{fmt(row.total_requests)}</td>
                                                    <td className="py-2.5 px-4 text-right font-bold text-primary">{fmt(row.completed_deals)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Collab Type */}
                        <div className="border border-border bg-card">
                            <SectionHeader title="By Collab Type" sub="Paid, barter, hybrid" />
                            {data.collab_type_breakdown.length === 0 ? (
                                <div className="p-8 text-center text-xs text-muted-foreground">No data</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-border text-muted-foreground">
                                                <th className="py-2.5 px-4 font-semibold">Type</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Requests</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Completed</th>
                                                <th className="py-2.5 px-4 font-semibold text-right">Volume (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {data.collab_type_breakdown.map((row) => (
                                                <tr key={row.collab_type} className="hover:bg-muted/30">
                                                    <td className="py-2.5 px-4">
                                                        <span className="capitalize font-semibold text-foreground">{row.collab_type}</span>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-right">{fmt(row.total_requests)}</td>
                                                    <td className="py-2.5 px-4 text-right font-bold text-primary">{fmt(row.completed_deals)}</td>
                                                    <td className="py-2.5 px-4 text-right">₹{fmt(row.offered_amount_of_completed_deals)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Status Breakdown */}
                        <div className="border border-border bg-card">
                            <SectionHeader title="By Status" sub="Request outcomes breakdown" />
                            {data.status_breakdown.length === 0 ? (
                                <div className="p-8 text-center text-xs text-muted-foreground">No data</div>
                            ) : (
                                <div className="p-5 space-y-3">
                                    {data.status_breakdown.map((row) => {
                                        const pct = Number(row.pct) || 0
                                        return (
                                            <div key={row.status} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="capitalize font-semibold text-foreground">
                                                        {row.status}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {fmt(row.total_requests)} ({pct.toFixed(1)}%)
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-muted w-full">
                                                    <div
                                                        className={`h-full transition-all ${
                                                            row.status === 'completed'
                                                                ? 'bg-primary'
                                                                : row.status === 'rejected'
                                                                ? 'bg-destructive'
                                                                : row.status === 'pending'
                                                                ? 'bg-warning'
                                                                : 'bg-muted-foreground'
                                                        }`}
                                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

