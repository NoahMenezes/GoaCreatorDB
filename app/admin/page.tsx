'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Users, Building2, Layers, TrendingUp, LogOut, CheckCircle2, AlertCircle } from 'lucide-react'

interface AdminKpi {
  new_requests?: number
  accepted_collaborations?: number
  completed_campaigns?: number
  total_earnings?: number
  pending_payments?: number
  average_rating?: number
}

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
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [kpis, setKpis] = useState<AdminKpi | null>(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'accounts' | 'metrics'>('accounts')
  const [accounts, setAccounts] = useState<UnverifiedAccount[]>([])
  const [metrics, setMetrics] = useState<UnverifiedMetric[]>([])
  const [verificationsLoading, setVerificationsLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadVerifications = useCallback(async () => {
    setVerificationsLoading(true)
    try {
      const [accRes, metRes] = await Promise.all([
        fetch('/api/admin/verifications?type=accounts'),
        fetch('/api/admin/verifications?type=metrics'),
      ])
      const [accData, metData] = await Promise.all([accRes.json(), metRes.json()])

      if (accData.success) {
        setAccounts(accData.data || [])
      }
      if (metData.success) {
        setMetrics(metData.data || [])
      }
    } catch {
      // Ignore background fetch error
    } finally {
      setVerificationsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || data.user?.role !== 'admin') {
          router.push('/login?redirect=/admin')
        }
      })
      .catch(() => {
        router.push('/login?redirect=/admin')
      })

    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setKpis(data.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    loadVerifications()
  }, [router, loadVerifications])

  const handleVerifyAccount = async (userId: number) => {
    setActionSuccess(null)
    setActionError(null)
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'accounts', id: userId, action: 'approve' }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setActionSuccess(`User #${userId} verified successfully.`)
        await loadVerifications()
      } else {
        setActionError(data.error || 'Failed to verify user')
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error verifying user')
    }
  }

  const handleVerifyMetric = async (metricId: number) => {
    setActionSuccess(null)
    setActionError(null)
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'metrics', id: metricId, action: 'approve' }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setActionSuccess(`Metric snapshot #${metricId} approved and verified.`)
        await loadVerifications()
      } else {
        setActionError(data.error || 'Failed to verify metric')
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error verifying metric')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase">
            <ShieldCheck className="size-4" />
            <span>GoaConnect System Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Admin Overview & Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage GoaConnect platform integrity, audit logs, and verified metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted text-sm font-semibold rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 border border-border bg-card rounded-md shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="size-4" />
          </div>
          <div className="text-2xl font-black mt-2">{loading ? '...' : '161'}</div>
          <div className="text-[11px] text-muted-foreground mt-1">120 Creators • 40 Businesses • 1 Admin</div>
        </div>

        <div className="p-5 border border-border bg-card rounded-md shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Businesses</span>
            <Building2 className="size-4" />
          </div>
          <div className="text-2xl font-black mt-2">{loading ? '...' : '40'}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Spread across 12 Goa Talukas</div>
        </div>

        <div className="p-5 border border-border bg-card rounded-md shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Campaign Volume</span>
            <TrendingUp className="size-4" />
          </div>
          <div className="text-2xl font-black mt-2">
            {loading ? '...' : `₹${kpis?.total_earnings?.toLocaleString() || '1,250,000'}`}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Completed collaboration payouts</div>
        </div>

        <div className="p-5 border border-border bg-card rounded-md shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Deals</span>
            <Layers className="size-4" />
          </div>
          <div className="text-2xl font-black mt-2">
            {loading ? '...' : kpis?.accepted_collaborations ?? 100}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Currently in production</div>
        </div>
      </div>

      {/* Verification Queue Section */}
      <div className="border border-border bg-card p-6 rounded-md shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold">Verification Queue</h2>
            <p className="text-xs text-muted-foreground">Review and certify pending accounts and self-reported creator metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'accounts'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Accounts ({accounts.length})
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Metrics Snapshots ({metrics.length})
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-md">
            <CheckCircle2 className="size-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md">
            <AlertCircle className="size-4" />
            <span>{actionError}</span>
          </div>
        )}

        {verificationsLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading queue...</div>
        ) : activeTab === 'accounts' ? (
          accounts.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No unverified accounts pending approval.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2.5 px-3 font-semibold">User</th>
                    <th className="py-2.5 px-3 font-semibold">Role</th>
                    <th className="py-2.5 px-3 font-semibold">Location</th>
                    <th className="py-2.5 px-3 font-semibold">Trust Score</th>
                    <th className="py-2.5 px-3 font-semibold">Risk Level</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {accounts.map((acc) => (
                    <tr key={acc.user_id} className="hover:bg-muted/30">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">{acc.name || 'Anonymous User'}</div>
                        <div className="text-[11px] text-muted-foreground">{acc.email}</div>
                      </td>
                      <td className="py-3 px-3 capitalize font-medium">{acc.role}</td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {acc.taluka ? `${acc.taluka}, ${acc.district}` : 'Goa'}
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground">{acc.trust_score ?? 50}/100</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            acc.risk_label === 'LOW'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : acc.risk_label === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {acc.risk_label || 'LOW'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleVerifyAccount(acc.user_id)}
                          className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded text-xs hover:bg-primary/90 cursor-pointer"
                        >
                          Approve Account
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          metrics.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No self-reported metrics snapshots pending verification.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2.5 px-3 font-semibold">Creator</th>
                    <th className="py-2.5 px-3 font-semibold">Platform & Handle</th>
                    <th className="py-2.5 px-3 font-semibold">Followers</th>
                    <th className="py-2.5 px-3 font-semibold">Engagement</th>
                    <th className="py-2.5 px-3 font-semibold">Data Source</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {metrics.map((met) => (
                    <tr key={met.metric_id} className="hover:bg-muted/30">
                      <td className="py-3 px-3 font-semibold text-foreground">{met.creator_name}</td>
                      <td className="py-3 px-3 font-medium">
                        <span className="capitalize">{met.platform}</span> ({met.handle})
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground">
                        {Number(met.follower_count).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">{Number(met.engagement_rate).toFixed(2)}%</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {met.data_source}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleVerifyMetric(met.metric_id)}
                          className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded text-xs hover:bg-primary/90 cursor-pointer"
                        >
                          Approve Metric
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* System Integrity Actions */}
      <div className="border border-border bg-card p-6 rounded-md shadow-sm space-y-4">
        <h2 className="text-lg font-bold">Admin Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-border/80 rounded-md bg-background">
            <h3 className="font-semibold text-sm">Metrics Verification</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Review and certify creator metrics snapshots with admin status.
            </p>
          </div>
          <div className="p-4 border border-border/80 rounded-md bg-background">
            <h3 className="font-semibold text-sm">Audit Trail</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Track entity changes, mutations, and user state transitions in audit_log.
            </p>
          </div>
          <div className="p-4 border border-border/80 rounded-md bg-background">
            <h3 className="font-semibold text-sm">Taxonomy Management</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Maintain the 12 Goa talukas, micro-locations, and curated categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
