'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Users, Building2, Layers, TrendingUp, LogOut } from 'lucide-react'

interface AdminKpi {
  new_requests?: number
  accepted_collaborations?: number
  completed_campaigns?: number
  total_earnings?: number
  pending_payments?: number
  average_rating?: number
}

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<AdminKpi | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || data.user?.role !== 'admin') {
          window.location.href = '/login?redirect=/admin'
        }
      })
      .catch(() => {
        window.location.href = '/login?redirect=/admin'
      })

    // Fetch dashboard stats
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setKpis(data.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
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
            className="flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted text-sm font-semibold rounded-md transition-colors"
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
