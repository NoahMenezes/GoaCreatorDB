'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Camera,
    Image as ImageIcon,
    MapPin,
    X,
    CheckCircle2,
    Globe,
    Link as LinkIcon,
    User as UserIcon,
    ShieldCheck as ShieldCheckIcon,
    Link2,
    Loader2,
} from 'lucide-react'

const regions = [
    { id: 'anjuna', name: 'Anjuna' },
    { id: 'siolim', name: 'Siolim' },
    { id: 'panjim', name: 'Panjim' },
    { id: 'mandrem', name: 'Mandrem' },
]

const niches = [
    { id: 'food', name: 'Food & Dining', primary: true, selected: true },
    { id: 'boutique', name: 'Boutique Stays & Heritage', selected: true },
    { id: 'lifestyle', name: 'Lifestyle & Culture', selected: true },
    { id: 'nightlife', name: 'Nightlife & Music', selected: false },
    { id: 'travel', name: 'Travel & Escapes', selected: false },
    { id: 'fitness', name: 'Fitness & Surf', selected: false },
]

const deliverables = [
    {
        id: 'reel',
        title: 'Dedicated Instagram Reel',
        desc: 'High fidelity 4K vertical footage with original audio narration or trending audio.',
        tag: 'Primary',
        selected: true,
    },
    {
        id: 'carousel',
        title: 'Photo Carousel (6–10 Slides)',
        desc: 'Atmospheric interior, food plating, and landscape lifestyle portraits.',
        tag: 'Editorial',
        selected: true,
    },
    {
        id: 'story',
        title: 'Story Sequence (3–5 Frames)',
        desc: 'Real-time tags, location stickers, reservation booking links, and call to action.',
        tag: '24HR BLAST',
        selected: true,
    },
    {
        id: 'license',
        title: 'Full Commercial Ad Licensing',
        desc: 'Meta Partnership Ad permission and brand handles organic repost rights.',
        tag: '30 DAYS',
        selected: true,
    },
]

export default function CreatorProfilePage() {
    const [barter, setBarter] = useState(true)
    const [minFloor, setMinFloor] = useState('8000')
    const [reelRate, setReelRate] = useState('14000')
    const [selectedRegions, setSelectedRegions] = useState(new Set(regions.map((r) => r.id)))
    const [selectedNiches, setSelectedNiches] = useState(
        new Set(niches.filter((n) => n.selected).map((n) => n.id)),
    )
    const [saving, setSaving] = useState(false)

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile', { credentials: 'include' })
            if (res.ok) {
                const data = await res.json()
                const profile = data.data?.profile
                if (profile) {
                    setBarter(profile.accepts_barter === 1)
                    setMinFloor(String(profile.min_paid_rate || 8000))
                    setReelRate(String(profile.min_paid_rate || 14000))
                }
            }
        } catch (err) {
            console.error('Profile fetch error:', err)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProfile()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: document.querySelector('input[defaultValue="Sneha Fernandes"]')?.getAttribute('value') || 'Sneha Fernandes',
                    bio: '',
                    accepts_barter: barter,
                    min_paid_rate: parseInt(minFloor, 10) || 8000,
                    location_id: '',
                }),
                credentials: 'include',
            })
            if (res.ok) {
                alert('Profile saved successfully.')
                fetchProfile()
            } else {
                alert('Failed to save profile.')
            }
        } catch {
            alert('Error saving profile.')
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = (e: React.FormEvent) => {
        e.preventDefault()
        fetchProfile()
    }

    const toggleRegion = (id: string) => {
        setSelectedRegions((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleNiche = (id: string) => {
        setSelectedNiches((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <main className="space-y-10">
            {/* 1. HEADER BANNER */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1.5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        Edit Creator Profile
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your public portfolio, verified badges, bio, and collaboration terms visible to Goan businesses.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-end">
                    <Link
                        href="/creator/profile"
                        className="flex items-center gap-2 border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors rounded-sm cursor-pointer"
                    >
                        <span>View Public Profile</span>
                        <Link2 className="size-3.5 text-muted-foreground" />
                    </Link>
                </div>
            </div>

            {/* 2. TWO-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Visual Identity & Biography */}
                    <section className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <Camera className="size-4 text-primary" />
                            <h3 className="text-sm font-bold text-foreground">Visual Identity & Biography</h3>
                            <span className="ml-auto text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                Your visual card as seen by hospitality partners.
                            </span>
                        </div>

                        {/* Profile Photo */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-6">
                            <div className="relative shrink-0">
                                <Image
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"
                                    alt="Sneha Fernandes"
                                    width={140}
                                    height={140}
                                    className="size-40 object-cover rounded-md border border-border/60"
                                />
                                <button className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-md p-2 hover:bg-primary/90 transition-colors shadow-sm">
                                    <Camera className="size-3.5" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
                                    >
                                        <Camera className="size-3.5" />
                                        <span>Change Photo</span>
                                    </button>
                                    <button className="text-xs font-medium text-muted-foreground hover:text-primary underline">Remove</button>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Recommended: Square format 400x400px (JPG or PNG, max 4MB). High resolution headshots convert better.
                                </p>
                            </div>
                        </div>

                        {/* Name + Instagram */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Full Legal Name</label>
                                <div className="flex items-center gap-2">
                                    <div className="size-7 border border-border bg-background rounded-lg pl-3 pr-2 text-xs text-muted-foreground">
                                        <UserIcon className="size-3.5" />
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue="Sneha Fernandes"
                                        className="flex-1 border border-border bg-background rounded-lg pl-2 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Instagram Handle</label>
                                <div className="flex items-center gap-2">
                                    <div className="size-7 border border-border bg-background rounded-lg pl-3 pr-2 text-xs text-muted-foreground">
                                        @
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue="sneha_curates"
                                        className="flex-1 border border-border bg-background rounded-lg pl-2 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <CheckCircle2 className="size-4 text-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                    Curated Editorial Bio
                                </label>
                                <span className="text-[10px] text-muted-foreground font-mono">210 / 280</span>
                            </div>
                            <textarea
                                defaultValue="Visual storyteller & food writer documenting Goa's emerging culinary culture, artisanal cafes, and boutique heritage stays. Featured in Condé Nast Traveller & Nat Geo India."
                                rows={5}
                                className="w-full border border-border bg-background rounded-sm p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed resize-none"
                            />
                        </div>

                        <div className="mt-5 flex items-center gap-2 text-[11px]">
                            <CheckCircle2 className="size-3.5 text-primary" />
                            <span className="text-muted-foreground">
                                Unsaved edits will apply across all discovery filters automatically.
                            </span>
                        </div>
                    </section>

                    {/* Locations */}
                    <section className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                            <Globe className="size-4 text-primary" />
                            <h3 className="text-sm font-bold text-foreground">Service Locations</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 border border-border bg-background rounded-sm pl-3 pr-3 py-2 text-sm text-foreground">
                                <MapPin className="mr-2 size-4 text-primary" />
                                Assagao, North Goa
                                <span className="ml-auto text-[10px] text-muted-foreground font-normal uppercase tracking-wider">▾</span>
                            </div>
                            <div className="flex-1 border border-border bg-background rounded-sm pl-3 pr-3 py-2 text-sm text-foreground">
                                <LinkIcon className="mr-2 size-4 text-primary" />
                                All North & Central Goa (No travel fee)
                                <span className="ml-auto text-[10px] text-muted-foreground font-normal uppercase tracking-wider">▾</span>
                            </div>
                        </div>

                        <div className="border-t border-border pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="size-4 text-primary" />
                                <h3 className="text-sm font-bold text-foreground">Frequent Shooting Regions</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {regions.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => toggleRegion(r.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors border ${
                                            selectedRegions.has(r.id)
                                                ? 'border-primary/50 bg-primary/10 text-primary'
                                                : 'border-border bg-background text-muted-foreground hover:text-primary hover:border-primary/50'
                                        }`}
                                    >
                                        <span>{r.name}</span>
                                        {selectedRegions.has(r.id) && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleRegion(r.id)
                                                }}
                                                className="size-4 rounded-md border border-background bg-primary text-[8px] font-bold flex items-center justify-center cursor-pointer text-primary-foreground"
                                            >
                                                <X className="size-2.5" />
                                            </button>
                                        )}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {}}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm border border-border bg-background text-xs font-medium text-primary hover:border-primary/50 transition-colors"
                                >
                                    <span className="text-xs">+</span>
                                    <span>Add Region</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Niches */}
                    <section className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm space-y-3">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="size-4 text-primary" />
                                <h3 className="text-sm font-bold text-foreground">Niches & Creative Domains</h3>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                {selectedNiches.size} Selected
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-4">
                            Click to toggle. Star one as your primary indexing category.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {niches.map((n) => {
                                const isSelected = selectedNiches.has(n.id)
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => toggleNiche(n.id)}
                                        className={`p-3 rounded-sm border transition-colors cursor-pointer text-left ${
                                            isSelected
                                                ? n.primary
                                                    ? 'border-primary/50 bg-primary/10 text-primary'
                                                    : 'border-primary/50 bg-primary/10 text-primary'
                                                : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                n.primary ? 'text-primary' : 'text-muted-foreground'
                                            }`}>
                                                {n.primary ? 'PRIMARY' : ''}
                                            </span>
                                            {isSelected && (
                                                <CheckCircle2 className="size-4 text-primary" />
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-foreground">{n.name}</span>
                                        {!isSelected && (
                                            <div className="mt-2 inline-flex items-center gap-1 text-xs">
                                                <span className="text-primary font-medium">+</span>
                                                <span className="text-muted-foreground">Add</span>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm sticky top-24 space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheckIcon className="size-4 text-primary" />
                            <h3 className="text-sm font-bold text-foreground">Rate Card & Commercial Terms</h3>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium ml-auto">
                                Set thresholds for inbound requests.
                            </span>
                        </div>

                        {/* Barter toggle */}
                        <div className="p-3 rounded-sm border border-border bg-muted/50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-5 rounded-sm border border-border bg-background flex items-center justify-center text-muted-foreground">
                                    <LinkIcon className="size-3" />
                                </div>
                                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                                    Accept Barter & Hosted Stays
                                </span>
                            </div>
                            <button
                                onClick={() => setBarter((b) => !b)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer ${
                                    barter ? 'bg-primary' : 'bg-muted'
                                }`}
                                aria-label="Accept barter toggle"
                            >
                                <span
                                    className={`block size-4 rounded-md bg-background transition-transform duration-200 ${
                                        barter ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                            <p className="text-[10px] text-muted-foreground mt-2">
                                Open to curated complimentary stays & dining in exchange for deliverables.
                            </p>
                        </div>

                        {/* Rate inputs */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                Minimum Booking Floor (₹)
                            </label>
                            <div className="flex items-end gap-1">
                                <span className="text-xs font-medium text-muted-foreground">₹</span>
                                <input
                                    type="text"
                                    defaultValue={minFloor}
                                    onChange={(e) => setMinFloor(e.target.value.replace(/\D/g, ''))}
                                    className="text-lg font-black text-foreground border-none bg-transparent focus:ring-0 w-20"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Businesses offering less than this will be auto-filtered.
                            </p>
                        </div>

                        <div className="space-y-2 border-t border-border pt-4">
                            <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                Standard Reel Base Rate (₹)
                            </label>
                            <div className="flex items-end gap-1">
                                <span className="text-xs font-medium text-muted-foreground">₹</span>
                                <input
                                    type="text"
                                    defaultValue={reelRate}
                                    onChange={(e) => setReelRate(e.target.value.replace(/\D/g, ''))}
                                    className="text-lg font-black text-foreground border-none bg-transparent focus:ring-0 w-20"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Includes on-site shoot (2 hrs) + color grade + audio curation.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <button
                                onClick={handleDiscard}
                                className="flex-1 border border-border bg-background text-muted-foreground text-xs font-bold px-4 py-3 rounded-sm transition-colors hover:bg-muted cursor-pointer"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-3 rounded-sm shadow-sm transition-colors cursor-pointer"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </section>

                    {/* Deliverables */}
                    <section className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <LinkIcon className="size-4 text-primary" />
                            <h3 className="text-sm font-bold text-foreground">Standard Deliverables Package</h3>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium ml-auto">
                                Included in brand pitch proposals.
                            </span>
                        </div>

                        {deliverables.map((d) => (
                            <div
                                key={d.id}
                                className={`flex items-start gap-3 p-3 rounded-sm border transition-colors ${
                                    d.selected
                                        ? 'border-primary/50 bg-primary/5'
                                        : 'border-border bg-background hover:border-primary/50'
                                } mb-3`}
                            >
                                <div className="size-6 rounded-sm bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                    <LinkIcon className="size-3" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-foreground">{d.title}</span>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border text-primary border-primary/30 bg-primary/5`}>
                                            {d.tag}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">{d.desc}</p>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Completion */}
                    <section className="border border-border bg-card p-4 rounded-sm shadow-sm flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold mb-1">
                                <span className="text-primary">↗</span>
                                <span>Profile Completion Score</span>
                            </div>
                            <div className="text-lg font-black text-foreground">96% Completed</div>
                        </div>
                        <div className="size-10 rounded-md border-4 border-muted/50 bg-background flex items-center justify-center">
                            <div className="size-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center text-[10px] font-bold">
                                96%
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}
