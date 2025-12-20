'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Listens for global events and refreshes the server components when necessary.
 * This ensures the dashboard stats are always in sync with client-side actions.
 */
export default function DashboardSyncer() {
    const router = useRouter()

    useEffect(() => {
        const handleRefresh = () => {
            console.log('Syncing dashboard data...')
            router.refresh()
        }

        // Listen for updates from other components
        window.addEventListener('video-updated', handleRefresh)
        window.addEventListener('team-member-updated', handleRefresh)

        return () => {
            window.removeEventListener('video-updated', handleRefresh)
            window.removeEventListener('team-member-updated', handleRefresh)
        }
    }, [router])

    return null // Invisible component
}
