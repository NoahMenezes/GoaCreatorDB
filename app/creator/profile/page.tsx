'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Camera,
    Image as ImageIcon,
    MapPin,
    Star,
    X,
    CheckCircle2,
    Globe,
    Share2,
    Link as LinkIcon,
    User as UserIcon,
    ShieldCheck as ShieldCheckIcon,
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
        tagColor: 'text-teal-400',
        selected: true,
    },
    {
        id: 'carousel',
        title: 'Photo Carousel (6–10 Slides)',
        desc: 'Atmospheric interior, food plating, and landscape lifestyle portraits.',
        tag: 'Editorial',
        tagColor: 'text-teal-400',
        selected: true,
    },
    {
        id: 'story',
        title: 'Story Sequence (3–5 Frames)',
        desc: 'Real-time tags, location stickers, reservation booking links, and call to action.',
        tag: '24HR BLAST',
        tagColor: 'text-teal-400',
        selected: true,
    },
    {
        id: 'license',
        title: 'Full Commercial Ad Licensing',
        desc: 'Meta Partnership Ad permission and brand handles organic repost rights.',
        tag: '30 DAYS',
        tagColor: 'text-orange-600',
        selected: true,
    },
]

export default function CreatorProfilePage() {
    const [barter, setBarter] = useState(true)
    const [minFloor, setMinFloor] = useState('₹ 8,000')
    const [reelRate, setReelRate] = useState('₹ 14,000')
    const [selectedRegions, setSelectedRegions] = useState(new Set(regions.map((r) => r.id)))
    const [selectedNiches, setSelectedNiches] = useState(
        new Set(niches.filter((n) => n.selected).map((n) => n.id)),
    )

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

    const toggleDeliverable = (id: string) => {
        // handled via UI only; state kept for parity
    }

    return (
        <main className="space-y-8">
            {/* 1. HEADER BANNER */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                            CREATOR CONFIGURATION
                        </span>
                        <span className="size-1.5 rounded-full bg-teal-400" />
                        <span className="text-xs font-medium text-[#6b7280]">Profile Settings</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1a1a2e]">
                        Edit Creator Profile
                    </h1>
                    <p className="text-sm text-[#6b7280] mt-1">
                        Manage your public portfolio, verified badges, bio, and collaboration terms visible to Goan businesses.
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-end">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-200 px-3 py-1 text-[11px] font-bold text-teal-700">
                        <span className="size-2 bg-teal-400 rounded-full" />
                        <span>Profile active &amp; indexed</span>
                    </span>
                    <Link
                        href="/creator/profile"
                        className="flex items-center gap-2 rounded-xl border border-[#ddd6fe]/60 bg-white px-3.5 py-2 text-xs font-bold text-[#1a1a2e] hover:bg-[#f3f0ff] transition-colors cursor-pointer"
                    >
                        <span>View Public Profile</span>
                        <LinkIcon className="size-3.5 text-[#6b7280]" />
                    </Link>
                </div>
            </div>

            {/* Bottom-left user mini card */}
            <div className="flex justify-start">
                <div className="rounded-xl border border-[#ddd6fe]/60 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="size-10 bg-[#e2e8f0] text-[#1a1a2e] flex items-center justify-center shrink-0 rounded-full">
                            <UserIcon className="size-5" />
                        </div>
                        <div className="text-left flex-1">
                            <div className="text-xs font-bold text-[#1a1a2e]">Sneha Fernandes</div>
                            <div className="flex items-center gap-1 text-[10px] text-[#6b7280]">
                                <span className="text-teal-400">@sneha_curates</span>
                                <span className="text-[#94a3b8]">✓</span>
                            </div>
                            <div className="text-[10px] text-[#6b7280] mt-0.5 flex items-center gap-1">
                                <MapPin className="size-3 text-teal-500" />
                                <span>Assagao, North Goa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. TWO-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Visual Identity & Biography */}
                    <section className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <Camera className="size-4 text-[#0c4e40]" />
                            <h3 className="text-sm font-bold text-[#1a1a2e]">Visual Identity &amp; Biography</h3>
                            <span className="ml-auto text-[10px] text-[#6b7280] uppercase tracking-wider font-medium">
                                Your visual card as seen by luxury hospitality partners.
                            </span>
                        </div>

                        {/* Profile Photo */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-6">
                            <div className="relative">
                                <Image
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"
                                    alt="Sneha Fernandes"
                                    width={150}
                                    height={150}
                                    className="size-40 object-cover rounded-2xl border border-[#ddd6fe]/40 shadow-sm"
                                />
                                <button className="absolute -bottom-2 -right-2 bg-[#0c4e40] text-white rounded-full p-2 hover:bg-teal-600 transition-colors shadow-sm">
                                    <Camera className="size-3.5" />
                                </button>
                                <div className="absolute -left-2 -top-2 size-6 bg-teal-400 text-white flex items-center justify-center rounded-full shadow-sm">
                                    <ImageIcon className="size-3" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        className="bg-[#0c4e40] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-600 transition-colors shadow-sm"
                                    >
                                        <Camera className="size-3.5" />
                                        <span>Change Photo</span>
                                    </button>
                                    <button className="text-xs font-medium text-[#6b7280] hover:text-[#0c4e40] underline">Remove</button>
                                </div>
                                <p className="text-[11px] text-[#6b7280] leading-relaxed">
                                    Recommended: Square format 400x400px (JPG or PNG, max 4MB). High resolution headshots convert 42% higher.
                                </p>
                            </div>
                        </div>

                        {/* Full Legal Name + Instagram Handle */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-[#1a1a2e] uppercase tracking-wider">Full Legal Name</label>
                                <div className="flex items-center gap-2">
                                    <div className="size-7 border border-[#ddd6fe]/60 bg-[#f8fafc] rounded-lg pl-3 pr-2 text-xs text-[#6b7280]">
                                        <UserIcon className="size-3.5 text-[#94a3b8]" />
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue="Sneha Fernandes"
                                        className="flex-1 border border-[#ddd6fe]/60 bg-[#f8fafc] rounded-lg pl-2 pr-3 py-2 text-xs text-[#1a1a2e] focus:outline-none focus:ring-1 focus:ring-[#0c4e40]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-[#1a1a2e] uppercase tracking-wider">Instagram Handle</label>
                                <div className="flex items-center gap-2">
                                    <div className="size-7 border border-[#ddd6fe]/60 bg-[#f8fafc] rounded-lg pl-3 pr-2 text-xs text-[#6b7280]">
                                        @
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue="sneha_curates"
                                        className="flex-1 border border-[#ddd6fe]/60 bg-[#f8fafc] rounded-lg pl-2 pr-3 py-2 text-xs text-[#1a1a2e] focus:outline-none focus:ring-1 focus:ring-[#0c4e40]"
                                    />
                                    <CheckCircle2 className="size-4 text-teal-400" />
                                </div>
                            </div>
                        </div>

                        {/* Curated Editorial Bio */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-[#1a1a2e] uppercase tracking-wider">
                                    Curated Editorial Bio
                                </label>
                                <span className="text-[10px] text-[#6b7280] font-mono">210 / 280</span>
                            </div>
                            <textarea
                                defaultValue="Visual storyteller & food writer documenting Goa&apos;s emerging culinary culture, artisanal cafes, and boutique heritage stays. Featured in Condé Nast Traveller & Nat Geo India."
                                rows={5}
                                className="w-full border border-[#ddd6fe]/60 bg-[#f8fafc] rounded-xl p-3 text-sm text-[#1a1a2e] focus:outline-none focus:ring-1 focus:ring-[#0c4e40] leading-relaxed resize-none"
                            />
                        </div>

                        <div className="mt-5 flex items-center gap-2 text-[11px]">
                            <CheckCircle2 className="size-3.5 text-teal-500" />
                            <span className="text-[#6b7280]">
                                Unsaved edits will apply across all North Goa discovery filters automatically.
                            </span>
                        </div>
                    </section>

                    {/* Location */}
                    <section className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe className="size-4 text-[#0c4e40]" />
                            <h3 className="text-sm font-bold text-[#1a1a2e]">Service Locations</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 border border-[#ddd6fe]/60 bg-[#f8fafc] rounded-xl pl-3 pr-3 py-2 text-sm text-[#1a1a2e]">
                                <MapPin className="mr-2 size-4 text-teal-500" />
                                Assagao, North Goa
                                <span className="ml-auto text-[10px] text-[#6b7280] font-normal uppercase tracking-wider">▾</span>
                            </div>
                            <div className="flex-1 border border-[#ddd6fe]/60 bg-[#f8fafc] rounded-xl pl-3 pr-3 py-2 text-sm text-[#1a1a2e]">
                                <LinkIcon className="mr-2 size-4 text-teal-500" />
                                All North &amp; Central Goa (No travel fee)
                                <span className="ml-auto text-[10px] text-[#6b7280] font-normal uppercase tracking-wider">▾</span>
                            </div>
                        </div>
                    </section>

                    {/* Frequent Shooting Regions */}
                    <section className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="size-4 text-[#0c4e40]" />
                            <h3 className="text-sm font-bold text-[#1a1a2e]">Frequent Shooting Regions</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {regions.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => toggleRegion(r.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                                        selectedRegions.has(r.id)
                                            ? 'border-teal-200 bg-teal-50 text-teal-700'
                                            : 'border-[#ddd6fe]/60 bg-[#f8fafc] text-[#6b7280] hover:border-teal-300'
                                    }`}
                                >
                                    <span>{r.name}</span>
                                    {selectedRegions.has(r.id) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleRegion(r.id)
                                            }}
                                            className="size-4 rounded-full border border-white bg-teal-400 text-teal-700 text-[8px] font-bold flex items-center justify-center cursor-pointer"
                                        >
                                            <X className="size-2.5" />
                                        </button>
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={() => {}}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ddd6fe]/60 bg-[#f8fafc] text-xs font-medium text-teal-700 hover:border-teal-300 transition-colors"
                            >
                                <span className="text-xs">+</span>
                                <span>Add Region</span>
                            </button>
                        </div>
                    </section>

                    {/* Niches & Creative Domains */}
                    <section className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="size-4 text-[#0c4e40]" />
                                <h3 className="text-sm font-bold text-[#1a1a2e]">Niches &amp; Creative Domains</h3>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                                {selectedNiches.size} Selected
                            </span>
                        </div>
                        <p className="text-[11px] text-[#6b7280] mb-4">
                            Click to toggle. Star one as your primary indexing category.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {niches.map((n) => {
                                const isSelected = selectedNiches.has(n.id)
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => toggleNiche(n.id)}
                                        className={`p-3 rounded-xl border transition-colors cursor-pointer text-left ${
                                            isSelected
                                                ? n.primary
                                                    ? 'border-teal-300 bg-teal-100 text-teal-800'
                                                    : 'border-teal-200 bg-teal-50 text-teal-700'
                                                : 'border-[#ddd6fe]/60 bg-[#f8fafc] text-[#6b7280] hover:border-teal-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                n.primary ? 'text-teal-600' : 'text-[#6b7280]'
                                            }`}>
                                                {n.primary ? '⭐ PRIMARY' : ''}
                                            </span>
                                            {isSelected && (
                                                <CheckCircle2 className="size-4 text-teal-400" />
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-[#1a1a2e]">{n.name}</span>
                                        {!isSelected && (
                                            <div className="mt-2 inline-flex items-center gap-1 text-xs">
                                                <span className="text-teal-700 font-medium">+</span>
                                                <span className="text-[#6b7280]">Add</span>
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
                    {/* Rate Card & Commercial Terms */}
                    <section className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm sticky top-24">
                        <div className="flex items-center gap-2 mb-5">
                            <ShieldCheckIcon className="size-4 text-[#0c4e40]" />
                            <h3 className="text-sm font-bold text-[#1a1a2e]">Rate Card &amp; Commercial Terms</h3>
                            <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-medium ml-auto">
                                Set minimum thresholds for inbound collaboration requests.
                            </span>
                        </div>

                        {/* Accept Barter */}
                        <div className="mb-5 p-3 rounded-xl bg-orange-50 border border-orange-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <LinkIcon className="size-3" />
                                </div>
                                <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                                    Accept Barter &amp; Hosted Stays
                                </span>
                            </div>
                            <button
                                onClick={() => setBarter((b) => !b)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0c4e40] cursor-pointer ${
                                    barter ? 'bg-teal-400' : 'bg-[#ddd6fe]'
                                }`}
                                aria-label="Accept barter toggle"
                            >
                                <span
                                    className={`block size-4 rounded-full bg-white transition-transform duration-200 ${
                                        barter ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                            <p className="text-[10px] text-[#6b7280] mt-2">
                                Open to curated complimentary boutique stays &amp; masterclass dining in exchange for deliverables.
                            </p>
                        </div>

                        {/* Minimum Booking Floor */}
                        <div className="space-y-2 mb-5">
                            <label className="text-[11px] font-bold text-[#1a1a2e] uppercase tracking-wider">
                                Minimum Booking Floor
                            </label>
                            <div className="flex items-end gap-1">
                                <span className="text-xs font-medium text-[#6b7280]">₹</span>
                                <input
                                    type="text"
                                    defaultValue={minFloor.replace('₹ ', '')}
                                    className="text-lg font-black text-[#1a1a2e] border-none bg-transparent focus:ring-0 w-20"
                                />
                            </div>
                            <p className="text-[10px] text-[#6b7280]">
                                Businesses offering less than this will be auto-filtered.
                            </p>
                        </div>

                        {/* Standard Reel Base Rate */}
                        <div className="space-y-2 mb-5 border-t border-[#ddd6fe]/40 pt-5">
                            <label className="text-[11px] font-bold text-[#1a1a2e] uppercase tracking-wider">
                                Standard Reel Base Rate
                            </label>
                            <div className="flex items-end gap-1">
                                <span className="text-xs font-medium text-[#6b7280]">₹</span>
                                <input
                                    type="text"
                                    defaultValue={reelRate.replace('₹ ', '')}
                                    className="text-lg font-black text-[#1a1a2e] border-none bg-transparent focus:ring-0 w-20"
                                />
                            </div>
                            <p className="text-[10px] text-[#6b7280]">
                                Includes on-site shoot (2 hrs) + color grade + audio curation.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <button
                                onClick={() => {}}
                                className="flex-1 border border-[#ddd6fe]/60 bg-white text-[#6b7280] text-xs font-bold px-4 py-3 rounded-xl transition-colors hover:bg-[#f3f0ff] cursor-pointer"
                            >
                                Cancel / Discard
                            </button>
                            <button
                                onClick={() => {}}
                                className="flex-1 bg-[#0c4e40] hover:bg-teal-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-sm transition-colors cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>

                        {/* Standard Deliverables Package */}
                        <section className="mt-6 border border-[#ddd6fe]/60 bg-white p-5 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <LinkIcon className="size-4 text-[#0c4e40]" />
                                <h3 className="text-sm font-bold text-[#1a1a2e]">Standard Deliverables Package</h3>
                                <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-medium ml-auto">
                                    Included by default in your brand pitch proposals.
                                </span>
                            </div>

                            {deliverables.map((d) => (
                                <div
                                    key={d.id}
                                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                                        d.selected
                                            ? 'border-teal-100 bg-teal-50'
                                            : 'border-[#ddd6fe]/60 bg-[#f8fafc] hover:border-teal-300'
                                    } mb-3`}
                                >
                                    <div className="size-6 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
                                        <LinkIcon className="size-3" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-[#1a1a2e]">{d.title}</span>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${d.tagColor} bg-white`}>
                                                {d.tag}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-[#6b7280] leading-relaxed">{d.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Profile Completion Score */}
                        <section className="mt-6 border border-[#ddd6fe]/60 bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-1 text-[10px] text-[#6b7280] font-bold mb-1">
                                    <span className="text-teal-400">↗</span>
                                    <span>Profile Completion Score</span>
                                </div>
                                <div className="text-lg font-black text-[#1a1a2e]">96% Completed</div>
                            </div>
                            <div className="size-10 rounded-full border-4 border-teal-100 bg-[#f5f2ff] flex items-center justify-center">
                                <div className="size-8 bg-teal-400 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                    96%
                                </div>
                            </div>
                        </section>
                    </section>
                </div>
            </div>
        </main>
    )
}
