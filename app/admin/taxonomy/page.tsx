'use client'

import { useCallback, useEffect, useState } from 'react'
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    MapPin,
    Pencil,
    Plus,
    Tags,
    Trash2,
    X,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
    category_id: number
    category_name: string
    description?: string
    creator_count: number
}

interface Location {
    location_id: number
    area_name: string
    taluka: string
    district: string
    creator_count: number
    business_count: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function EditDialog({
    open,
    onClose,
    onSave,
    title,
    children,
}: {
    open: boolean
    onClose: () => void
    onSave: () => void
    title: string
    children: React.ReactNode
}) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="relative w-full max-w-sm border border-border bg-card p-6 shadow-2xl space-y-5">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 size-7 flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                    <X className="size-4" />
                </button>
                <h3 className="text-sm font-bold text-foreground pr-8">{title}</h3>
                <div className="space-y-3">{children}</div>
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
                        onClick={onSave}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-2 cursor-pointer transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

function ConfirmDeleteDialog({
    open,
    name,
    inUseMsg,
    onClose,
    onConfirm,
}: {
    open: boolean
    name: string
    inUseMsg?: string
    onClose: () => void
    onConfirm: () => void
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
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-foreground">Delete &ldquo;{name}&rdquo;?</h3>
                    {inUseMsg ? (
                        <div className="p-3 border border-warning/30 bg-warning/5 text-warning text-xs font-semibold">
                            {inUseMsg}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            This action cannot be undone. Are you sure?
                        </p>
                    )}
                </div>
                {!inUseMsg && (
                    <div className="flex gap-2">
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
                            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold px-4 py-2 cursor-pointer transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                )}
                {inUseMsg && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full border border-border bg-background text-foreground text-xs font-semibold px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Categories Panel ─────────────────────────────────────────────────────────

function CategoriesPanel() {
    const [items, setItems] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    // Add/Edit dialog
    const [editDialog, setEditDialog] = useState<{
        open: boolean
        id?: number
        name: string
        description: string
    }>({ open: false, name: '', description: '' })

    // Delete dialog
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        id: number
        name: string
        inUseMsg?: string
    } | null>(null)

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg })
        setTimeout(() => setToast(null), 3000)
    }

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/admin/categories')
            const data = await res.json()
            if (data.success) setItems(data.data || [])
            else setError(data.error || 'Failed to load categories')
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Network error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleSave = async () => {
        const { id, name, description } = editDialog
        if (!name.trim()) return
        try {
            const method = id ? 'PUT' : 'POST'
            const url = id ? `/api/admin/categories/${id}` : '/api/admin/categories'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_name: name.trim(), description: description.trim() }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                showToast('success', id ? 'Category updated.' : 'Category added.')
                setEditDialog({ open: false, name: '', description: '' })
                await load()
            } else {
                showToast('error', data.error || 'Failed to save category')
            }
        } catch (e) {
            showToast('error', e instanceof Error ? e.message : 'Error')
        }
    }

    const handleDelete = async (id: number, name: string) => {
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (res.ok && data.success) {
                showToast('success', `"${name}" deleted.`)
                setDeleteDialog(null)
                await load()
            } else if (res.status === 409) {
                // Show the 409 in-use message
                setDeleteDialog((prev) =>
                    prev ? { ...prev, inUseMsg: data.error || 'Item is still in use and cannot be deleted.' } : null
                )
            } else {
                showToast('error', data.error || 'Failed to delete')
                setDeleteDialog(null)
            }
        } catch (e) {
            showToast('error', e instanceof Error ? e.message : 'Error')
            setDeleteDialog(null)
        }
    }

    return (
        <div className="border border-border bg-card flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <Tags className="size-4 text-primary" />
                        <h2 className="text-sm font-bold text-foreground">Categories</h2>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Niche / creator type taxonomy
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setEditDialog({ open: true, name: '', description: '' })}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                    <Plus className="size-3.5" />
                    Add
                </button>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`mx-5 mt-4 flex items-center gap-2 p-3 border text-xs font-semibold ${
                        toast.type === 'success'
                            ? 'bg-primary/5 border-primary/20 text-primary'
                            : 'bg-destructive/5 border-destructive/20 text-destructive'
                    }`}
                >
                    {toast.type === 'success' ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-3">
                        <Loader2 className="size-5 text-primary animate-spin" />
                        <span className="text-xs text-muted-foreground">Loading categories…</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <AlertCircle className="size-5 text-destructive" />
                        <p className="text-xs text-destructive font-semibold">{error}</p>
                        <button onClick={load} className="text-xs font-bold text-primary hover:underline">Retry</button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 m-5 border border-dashed border-border">
                        <Tags className="size-7 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">No categories yet. Add one above.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {items.map((cat) => (
                            <div
                                key={cat.category_id}
                                className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 group"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold text-foreground truncate">
                                        {cat.category_name}
                                    </div>
                                    {cat.description && (
                                        <div className="text-[10px] text-muted-foreground truncate">{cat.description}</div>
                                    )}
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        {cat.creator_count} creator{cat.creator_count !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditDialog({
                                                open: true,
                                                id: cat.category_id,
                                                name: cat.category_name,
                                                description: cat.description || '',
                                            })
                                        }
                                        className="size-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                                    >
                                        <Pencil className="size-3" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDeleteDialog({
                                                open: true,
                                                id: cat.category_id,
                                                name: cat.category_name,
                                            })
                                        }
                                        className="size-7 flex items-center justify-center border border-destructive/30 text-destructive hover:bg-destructive/5 cursor-pointer transition-colors"
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit/Add Dialog */}
            <EditDialog
                open={editDialog.open}
                onClose={() => setEditDialog({ open: false, name: '', description: '' })}
                onSave={handleSave}
                title={editDialog.id ? 'Edit Category' : 'Add Category'}
            >
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Category Name *</label>
                    <input
                        type="text"
                        value={editDialog.name}
                        onChange={(e) => setEditDialog((p) => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Food & Beverage"
                        className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Description</label>
                    <input
                        type="text"
                        value={editDialog.description}
                        onChange={(e) => setEditDialog((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Short description…"
                        className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </EditDialog>

            {/* Delete Dialog */}
            {deleteDialog && (
                <ConfirmDeleteDialog
                    open={deleteDialog.open}
                    name={deleteDialog.name}
                    inUseMsg={deleteDialog.inUseMsg}
                    onClose={() => setDeleteDialog(null)}
                    onConfirm={() => handleDelete(deleteDialog.id, deleteDialog.name)}
                />
            )}
        </div>
    )
}

// ─── Locations Panel ─────────────────────────────────────────────────────────

function LocationsPanel() {
    const [items, setItems] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    const [editDialog, setEditDialog] = useState<{
        open: boolean
        id?: number
        area_name: string
        taluka: string
        district: string
    }>({ open: false, area_name: '', taluka: '', district: 'North Goa' })

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        id: number
        name: string
        inUseMsg?: string
    } | null>(null)

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg })
        setTimeout(() => setToast(null), 3000)
    }

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/admin/locations')
            const data = await res.json()
            if (data.success) setItems(data.data || [])
            else setError(data.error || 'Failed to load locations')
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Network error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleSave = async () => {
        const { id, area_name, taluka, district } = editDialog
        if (!area_name.trim() || !taluka.trim() || !district) return
        try {
            const method = id ? 'PUT' : 'POST'
            const url = id ? `/api/admin/locations/${id}` : '/api/admin/locations'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ area_name: area_name.trim(), taluka: taluka.trim(), district }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                showToast('success', id ? 'Location updated.' : 'Location added.')
                setEditDialog({ open: false, area_name: '', taluka: '', district: 'North Goa' })
                await load()
            } else {
                showToast('error', data.error || 'Failed to save location')
            }
        } catch (e) {
            showToast('error', e instanceof Error ? e.message : 'Error')
        }
    }

    const handleDelete = async (id: number, name: string) => {
        try {
            const res = await fetch(`/api/admin/locations/${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (res.ok && data.success) {
                showToast('success', `"${name}" deleted.`)
                setDeleteDialog(null)
                await load()
            } else if (res.status === 409) {
                setDeleteDialog((prev) =>
                    prev ? { ...prev, inUseMsg: data.error || 'Location is still in use and cannot be deleted.' } : null
                )
            } else {
                showToast('error', data.error || 'Failed to delete')
                setDeleteDialog(null)
            }
        } catch (e) {
            showToast('error', e instanceof Error ? e.message : 'Error')
            setDeleteDialog(null)
        }
    }

    // Group by district > taluka
    const grouped = items.reduce(
        (acc, loc) => {
            const dist = loc.district || 'Unknown'
            const tal = loc.taluka || 'Unknown'
            if (!acc[dist]) acc[dist] = {}
            if (!acc[dist][tal]) acc[dist][tal] = []
            acc[dist][tal].push(loc)
            return acc
        },
        {} as Record<string, Record<string, Location[]>>
    )

    return (
        <div className="border border-border bg-card flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <MapPin className="size-4 text-primary" />
                        <h2 className="text-sm font-bold text-foreground">Locations</h2>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Grouped by district and taluka
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() =>
                        setEditDialog({ open: true, area_name: '', taluka: '', district: 'North Goa' })
                    }
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                    <Plus className="size-3.5" />
                    Add
                </button>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`mx-5 mt-4 flex items-center gap-2 p-3 border text-xs font-semibold ${
                        toast.type === 'success'
                            ? 'bg-primary/5 border-primary/20 text-primary'
                            : 'bg-destructive/5 border-destructive/20 text-destructive'
                    }`}
                >
                    {toast.type === 'success' ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-3">
                        <Loader2 className="size-5 text-primary animate-spin" />
                        <span className="text-xs text-muted-foreground">Loading locations…</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <AlertCircle className="size-5 text-destructive" />
                        <p className="text-xs text-destructive font-semibold">{error}</p>
                        <button onClick={load} className="text-xs font-bold text-primary hover:underline">Retry</button>
                    </div>
                ) : Object.keys(grouped).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 m-5 border border-dashed border-border">
                        <MapPin className="size-7 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">No locations yet. Add one above.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {Object.entries(grouped).map(([district, talukas]) => (
                            <div key={district}>
                                {/* District header */}
                                <div className="px-5 py-2 bg-muted/40 border-b border-border">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                        {district}
                                    </span>
                                </div>
                                {Object.entries(talukas).map(([taluka, locs]) => (
                                    <div key={taluka}>
                                        {/* Taluka sub-header */}
                                        <div className="px-5 py-1.5 bg-muted/20">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                {taluka}
                                            </span>
                                        </div>
                                        {locs.map((loc) => (
                                            <div
                                                key={loc.location_id}
                                                className="flex items-center justify-between px-5 py-2.5 hover:bg-muted/30 group border-t border-border/50"
                                            >
                                                <div>
                                                    <div className="text-xs font-semibold text-foreground">
                                                        {loc.area_name}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {loc.creator_count}C · {loc.business_count}B
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditDialog({
                                                                open: true,
                                                                id: loc.location_id,
                                                                area_name: loc.area_name,
                                                                taluka: loc.taluka,
                                                                district: loc.district,
                                                            })
                                                        }
                                                        className="size-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                                                    >
                                                        <Pencil className="size-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteDialog({
                                                                open: true,
                                                                id: loc.location_id,
                                                                name: loc.area_name,
                                                            })
                                                        }
                                                        className="size-7 flex items-center justify-center border border-destructive/30 text-destructive hover:bg-destructive/5 cursor-pointer transition-colors"
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit/Add Dialog */}
            <EditDialog
                open={editDialog.open}
                onClose={() =>
                    setEditDialog({ open: false, area_name: '', taluka: '', district: 'North Goa' })
                }
                onSave={handleSave}
                title={editDialog.id ? 'Edit Location' : 'Add Location'}
            >
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Area Name *</label>
                    <input
                        type="text"
                        value={editDialog.area_name}
                        onChange={(e) => setEditDialog((p) => ({ ...p, area_name: e.target.value }))}
                        placeholder="e.g. Calangute Beach Road"
                        className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Taluka *</label>
                    <input
                        type="text"
                        value={editDialog.taluka}
                        onChange={(e) => setEditDialog((p) => ({ ...p, taluka: e.target.value }))}
                        placeholder="e.g. Bardez"
                        className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">District *</label>
                    <select
                        value={editDialog.district}
                        onChange={(e) => setEditDialog((p) => ({ ...p, district: e.target.value }))}
                        className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                        <option value="North Goa">North Goa</option>
                        <option value="South Goa">South Goa</option>
                    </select>
                </div>
            </EditDialog>

            {/* Delete Dialog */}
            {deleteDialog && (
                <ConfirmDeleteDialog
                    open={deleteDialog.open}
                    name={deleteDialog.name}
                    inUseMsg={deleteDialog.inUseMsg}
                    onClose={() => setDeleteDialog(null)}
                    onConfirm={() => handleDelete(deleteDialog.id, deleteDialog.name)}
                />
            )}
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TaxonomyPage() {
    return (
        <main className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <Tags className="size-3" />
                        TAXONOMY
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    Taxonomy Management
                </h1>
                <p className="text-sm text-muted-foreground">
                    Manage creator categories and Goa location hierarchy (districts, talukas, areas).
                </p>
            </div>

            {/* Two-panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <CategoriesPanel />
                <LocationsPanel />
            </div>
        </main>
    )
}

