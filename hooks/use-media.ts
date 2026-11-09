'use client'

import { useSyncExternalStore } from 'react'

export function useMedia(query: string): boolean {
    const subscribe = (callback: () => void) => {
        const matchMedia = window.matchMedia(query)
        matchMedia.addEventListener('change', callback)
        return () => matchMedia.removeEventListener('change', callback)
    }

    const getSnapshot = () => {
        return window.matchMedia(query).matches
    }

    const getServerSnapshot = () => true

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
