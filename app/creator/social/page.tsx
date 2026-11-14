'use client'

import { useEffect, useState } from 'react'
import {
    Camera,
    Play,
    ShieldCheck,
    RefreshCw,
    Link as LinkIcon,
    Download,
} from 'lucide-react'
import { SocialAccountRow, SocialMetricRow } from '@/lib/db'

const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Camera, color: 'text-primary' },
    { id: 'youtube', name: 'YouTube', icon: Play, color: 'text-primary' },
]

export default function CreatorSocialPage() {
    const [accounts, setAccounts] = useState<SocialAccountRow[]>([])
    const [metrics, setMetrics] = useState<SocialMetricRow[]>([])
    const [connecting, setConnecting] = useState<string | null>(null)

    const loadData = async () => {
        try {
            const [accRes, metRes] = await Promise.all([
                fetch('/api/social/accounts', { credentials: 'include' }),
                fetch('/api/social/metrics', { credentials: 'include' }),
            ])
            if (accRes.ok) {
                const accData = await accRes.json()
                setAccounts(accData.data || [])
            }
            if (metRes.ok) {
                const metData = await metRes.json()
                setMetrics(metData.data || [])
            }
        } catch (err) {
            console.error('Social load error:', err)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleConnect = (platformId: string) => {
        setConnecting(platformId)
        setTimeout(() => {
            setConnecting(null)
            loadData()
        }, 1000)
    }

    const handleDisconnect = (id: number | string) => {
        if (!confirm('Disconnect this social account?')) return
        fetch(`/api/social/accounts?id=${id}`, {
            method: 'DELETE',
            credentials: 'include',
        }).then(() => loadData())
    }

    const handleSync = (accountId: number | string) => {
        setConnecting(String(accountId))
        fetch('/api/social/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ account_id: accountId }),
            credentials: 'include',
        }).then(async (res) => {
            const data = await res.json()
            setConnecting(null)
            loadData()
            if (data.message) alert(data.message)
        })
    }

    const getLatestMetric = (accountId: number | string): SocialMetricRow | null => {
        const found = metrics.find((metric) => Number(metric.account_id) === Number(accountId))
        return found || null
    }

    return (
        <main className="space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        Social Accounts & Metrics
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Connect your social platforms to sync audience metrics and performance data.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        className={`flex items-center gap-2 text-xs font-bold transition-colors rounded-sm border px-3 py-1.5 ${
                            connecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted'
                        }`}
                    >
                        <RefreshCw className="size-3.5" />
                        <span>Sync All</span>
                    </button>
                </div>
            </div>

            {/* Connection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms.map((plat) => {
                    const connected = accounts.find((a) => a.platform === plat.id)
                    const metric = connected ? getLatestMetric(connected.account_id) : null
                    return (
                        <div
                            key={plat.id}
                            className={`border border-border rounded-sm shadow-sm p-6 ${
                                connected ? 'bg-card' : 'bg-background'
                            } flex flex-col justify-between`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-sm flex items-center justify-center ${connected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                        <plat.icon className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">{plat.name}</h3>
                                        <span className={`text-[10px] font-bold uppercase ${
                                            connected ? 'text-primary' : 'text-muted-foreground'
                                        }`}>
                                            {connected ? 'CONNECTED' : 'CONNECT'}
                                        </span>
                                    </div>
                                </div>
                                {!connected && connecting !== plat.id ? (
                                    <button
                                        onClick={() => handleConnect(plat.id)}
                                        className="text-xs font-bold text-primary hover:text-primary/90 underline decoration-primary/30"
                                    >
                                        Connect
                                    </button>
                                ) : connecting === plat.id ? (
                                    <span className="text-xs text-muted-foreground">Connecting...</span>
                                ) : (
                                    <button
                                        onClick={() => handleDisconnect(connected!.account_id)}
                                        className="text-xs font-bold text-destructive hover:text-destructive/90"
                                    >
                                        Disconnect
                                    </button>
                                )}
                            </div>

                            {connected && (
                                <div className="mt-6 space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Followers', value: metric?.follower_count ? metric.follower_count.toLocaleString() : '--', source: metric?.data_source || 'self_reported' },
                                            { label: 'Engagement Rate', value: metric?.engagement_rate ? `${metric.engagement_rate}%` : '--', source: metric?.data_source || 'self_reported' },
                                            { label: 'Avg Likes', value: metric?.avg_likes ? Number(metric.avg_likes).toLocaleString() : '--', source: metric?.data_source || 'self_reported' },
                                        ].map((m) => (
                                            <div key={m.label} className="p-3 rounded-sm border border-border bg-background">
                                                <div className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">{m.label}</div>
                                                <div className="text-lg font-bold text-foreground">{m.value}</div>
                                                <div className="text-[9px] text-muted-foreground mt-1 italic">
                                                    Source: {m.source.replace('_', ' ')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <button
                                            onClick={() => handleSync(connected.account_id)}
                                            className={`w-full flex items-center justify-center gap-2 text-xs font-bold transition-colors rounded-sm border px-3 py-1.5 ${
                                                connecting === String(connected.account_id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted'
                                            }`}
                                        >
                                            <RefreshCw className="size-3.5" />
                                            <span>{connecting === String(connected.account_id) ? 'Syncing...' : 'Sync Metrics'}</span>
                                        </button>
                                    </div>

                                    <div className="text-[10px] text-muted-foreground italic mt-2">
                                        {metric?.data_source === 'admin_verified' ? 'Admin-verified metrics' : 'Self-reported metrics — pending admin verification.'}
                                    </div>
                                </div>
                            )}

                            {!connected && (
                                <div className="mt-8 text-center p-4 rounded-sm border border-dashed border-border bg-muted/30">
                                    <plat.icon className="size-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-xs text-muted-foreground">
                                        Connect {plat.name} to sync audience metrics, engagement rate, and performance data.
                                    </p>
                                    <p className="text-[9px] text-muted-foreground mt-1">
                                        Uses official {plat.name} API when credentials are configured.
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Integration Info */}
            <div className="border border-border bg-card p-6 rounded-sm shadow-sm">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-4">
                    About Social Integration
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                        <div>
                            <strong>No passwords required:</strong> We use OAuth flows. We never ask for your social media passwords.
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <LinkIcon className="size-4 text-primary shrink-0 mt-0.5" />
                        <div>
                            <strong>Admin-verified metrics:</strong> Metrics verified by platform administrators are marked as Admin-verified with verified badges.
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Download className="size-4 text-primary shrink-0 mt-0.5" />
                        <div>
                            <strong>Self-reported metrics:</strong> Connected or synced metrics start as self-reported until verified by platform administrators.
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}


