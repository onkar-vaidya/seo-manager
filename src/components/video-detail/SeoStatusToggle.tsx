'use client'

import { useState } from 'react'
import { toggleSeoDone } from '@/app/actions/seo'

interface SeoStatusToggleProps {
    videoId: string
    initialStatus: boolean
}

export default function SeoStatusToggle({ videoId, initialStatus }: SeoStatusToggleProps) {
    const [isDone, setIsDone] = useState(initialStatus)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)

        // Optimistic update
        const previousStatus = isDone
        setIsDone(!isDone)

        // Get current team member
        const memberData = localStorage.getItem('selected_team_member')
        const currentMember = memberData ? JSON.parse(memberData) : null

        const result = await toggleSeoDone(videoId, isDone, currentMember?.name)

        if (result && result.success && result.video) {
            // Update cache with new video data
            updateVideoInCache(result.video)
        } else {
            // Revert on error
            setIsDone(previousStatus)
            console.error('Failed to toggle SEO status')
        }

        setIsLoading(false)
    }

    const updateVideoInCache = (updatedVideo: any) => {
        // Update all videos cache
        const allVideosCache = localStorage.getItem('all_videos_cache')
        if (allVideosCache) {
            const videos = JSON.parse(allVideosCache)
            const index = videos.findIndex((v: any) => v.id === updatedVideo.id)
            if (index !== -1) {
                videos[index] = updatedVideo
                localStorage.setItem('all_videos_cache', JSON.stringify(videos))
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
            disabled={isLoading}
            className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm
                transition-all duration-200 whitespace-nowrap min-w-[100px] justify-center
                ${isDone
                    ? 'bg-success/10 text-success border-2 border-success/30 hover:bg-success/20'
                    : 'bg-warning/10 text-warning border-2 border-warning/30 hover:bg-warning/20'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
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
