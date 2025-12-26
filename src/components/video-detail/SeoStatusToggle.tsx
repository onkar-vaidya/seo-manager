'use client'

import { useState, useEffect } from 'react'
import { toggleSeoDone } from '@/app/actions/seo'
import { useBackgroundAction } from '@/components/providers/BackgroundActionProvider'

interface SeoStatusToggleProps {
    videoId: string
    initialStatus: boolean
}

export default function SeoStatusToggle({ videoId, initialStatus }: SeoStatusToggleProps) {
    const [isDone, setIsDone] = useState(initialStatus)
    const { addBackgroundAction } = useBackgroundAction()

    // Sync with local cache on mount to prevent "flicker" from stale server data
    useEffect(() => {
        try {
            // Check global cache first
            const allVideosCache = localStorage.getItem('all_videos_cache_v5')
            if (allVideosCache) {
                const videos = JSON.parse(allVideosCache)
                const cachedVideo = videos.find((v: any) => v.id === videoId)

                // If found and status differs, trust the cache (it's likely newer than server HTML)
                if (cachedVideo && cachedVideo.is_seo_done !== isDone) {
                    setIsDone(cachedVideo.is_seo_done)
                    return // Found in global, no need to check channel
                }
            }

            // Check channel cache as fallback (we don't easily know channelId here, 
            // but we can try iterating keys or just rely on global)
            // Note: The global cache update in handleToggle updates ALL relevant caches,
            // so checking global `all_videos_cache_v5` is usually sufficient if the user
            // has visited the main list.

        } catch (e) {
            console.error('Failed to sync SEO status from cache', e)
        }
    }, [videoId])

    const handleToggle = async () => {
        // Optimistic update
        const newStatus = !isDone
        setIsDone(newStatus)

        // Get current team member at the moment of click
        const memberData = localStorage.getItem('selected_team_member')
        const currentMember = memberData ? JSON.parse(memberData) : null

        addBackgroundAction({
            id: `toggle-seo-${videoId}`,
            action: async () => {
                const result = await toggleSeoDone(videoId, isDone, currentMember?.name)
                if (!result.success) {
                    throw new Error(result.error)
                }
                return result
            },
            onSuccess: (result) => {
                if (result.success && result.video) {
                    // Update cache with new video data
                    updateVideoInCache(result.video)
                }
            },
            onError: () => {
                // Revert on error
                setIsDone(!newStatus)
            },
            successMessage: newStatus ? 'SEO marked as done' : 'SEO marked as not done'
        })
    }

    const updateVideoInCache = (updatedVideo: any) => {
        // Update all videos cache
        const allVideosCache = localStorage.getItem('all_videos_cache_v5')
        if (allVideosCache) {
            const videos = JSON.parse(allVideosCache)
            // Preserve channel relation by spreading existing video + update
            const index = videos.findIndex((v: any) => v.id === updatedVideo.id)
            if (index !== -1) {
                videos[index] = { ...videos[index], ...updatedVideo }
                localStorage.setItem('all_videos_cache_v5', JSON.stringify(videos))
            }
        }

        // Update channel videos cache if exists
        const channelCacheKey = `channel_videos_${updatedVideo.channel_id}`
        const channelCache = localStorage.getItem(channelCacheKey)
        if (channelCache) {
            const videos = JSON.parse(channelCache)
            const index = videos.findIndex((v: any) => v.id === updatedVideo.id)
            if (index !== -1) {
                videos[index] = updatedVideo
                localStorage.setItem(channelCacheKey, JSON.stringify(videos))
            }
        }

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('video-updated', { detail: updatedVideo }))
    }

    return (
        <button
            onClick={handleToggle}
            className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm
                transition-all duration-200 whitespace-nowrap min-w-[100px] justify-center
                ${isDone
                    ? 'bg-success/10 text-success border-2 border-success/30 hover:bg-success/20'
                    : 'bg-warning/10 text-warning border-2 border-warning/30 hover:bg-warning/20'
                }
            `}
        >
            {isDone ? (
                <>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>SEO</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>SEO</span>
                </>
            )}
        </button>
    )
}
