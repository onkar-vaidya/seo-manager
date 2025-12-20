'use client'

import { useState, useEffect } from 'react'
import VideoListWithSearch from '@/components/videos/VideoListWithSearch'
import { VideoSeo } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

export default function VideosPage() {
    // Initialize with cached data immediately
    const getCachedVideos = () => {
        if (typeof window === 'undefined') return []
        const cached = localStorage.getItem('all_videos_cache_v4')
        const cacheTimestamp = localStorage.getItem('all_videos_cache_time_v4')

        if (cached && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp)
            if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
                try {
                    return JSON.parse(cached)
                } catch (e) {
                    return []
                }
            }
        }
        return []
    }

    const [videos, setVideos] = useState<VideoSeo[]>(getCachedVideos())
    const [loading, setLoading] = useState(videos.length === 0)
    const [loadingProgress, setLoadingProgress] = useState(0)

    useEffect(() => {
        loadAllVideos()

        // Listen for video updates
        const handleVideoUpdate = (event: any) => {
            const updatedVideo = event.detail
            setVideos(prevVideos => {
                const index = prevVideos.findIndex(v => v.id === updatedVideo.id)
                if (index !== -1) {
                    const newVideos = [...prevVideos]
                    // Preserve the channels relation if not present in update
                    newVideos[index] = {
                        ...newVideos[index],
                        ...updatedVideo
                    }

                    // Update cache immediately so it persists on navigation
                    localStorage.setItem('all_videos_cache_v4', JSON.stringify(newVideos))
                    return newVideos
                }
                return prevVideos
            })
        }

        window.addEventListener('video-updated', handleVideoUpdate)
        return () => window.removeEventListener('video-updated', handleVideoUpdate)
    }, [])

    const loadAllVideos = async () => {
        // Check for hard refresh (reload)
        const isReload = typeof window !== 'undefined' &&
            (window.performance?.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.type === "reload"

        // Check if we have cached videos
        const cached = localStorage.getItem('all_videos_cache_v4')
        const cacheTimestamp = localStorage.getItem('all_videos_cache_time_v4')

        // Use cache if it's less than 24 hours old
        if (cached && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp)
            if (cacheAge < 24 * 60 * 60 * 1000) {
                console.log('Using cached videos')
                const parsed = JSON.parse(cached)
                setVideos(parsed)
                setLoading(false)

                // CRITICAL: Return early to prevent unnecessary re-fetching
                // The cache is now the source of truth until manual reload or expiry
                return
            }
        }

        // Fetch all videos in batches
        const supabase = createClient()
        // Fetch all videos at once (virtualization handles the rendering performance)
        let batchSize = 1000
        let allVideos: any[] = []
        let offset = 0
        let hasMore = true

        while (hasMore) {
            const { data: batch, error } = await supabase
                .from('video_seo')
                .select(`
                    id,
                    channel_id,
                    video_id,
                    old_title,
                    is_seo_done,
                    created_at,
                    channels!inner (
                        id,
                        channel_name,
                        channel_id
                    )
                `)
                .order('created_at', { ascending: false })
                .range(offset, offset + batchSize - 1)

            if (error) {
                console.error('Error fetching videos:', error)
                break
            }

            if (batch && batch.length > 0) {
                allVideos = [...allVideos, ...batch]
                offset += batchSize

                hasMore = batch.length === batchSize

                // Update progress
                setLoadingProgress(Math.min(95, (allVideos.length / 2230) * 100))

                // Show partial results immediately
                setVideos(allVideos as any)
            } else {
                hasMore = false
            }
        }

        // Cache the results
        localStorage.setItem('all_videos_cache_v4', JSON.stringify(allVideos))
        localStorage.setItem('all_videos_cache_time_v4', Date.now().toString())

        setVideos(allVideos as any)
        setLoadingProgress(100)
        setLoading(false)
        console.log(`Loaded ${allVideos.length} videos`)
    }

    const handleForceRefresh = () => {
        // Clear cache
        localStorage.removeItem('all_videos_cache_v4')
        localStorage.removeItem('all_videos_cache_time_v4')
        // Trigger reload
        setVideos([])
        setLoading(true)
        loadAllVideos()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                {/* Manual Refresh Button */}
                <button
                    onClick={handleForceRefresh}
                    disabled={loading}
                    className="p-2 text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-lg transition-smooth disabled:opacity-50"
                    title="Force Refresh Data"
                >
                    <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>

                <div className="flex items-center gap-3 w-full justify-end">
                    {loading && (
                        <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-background-elevated rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent transition-all duration-300"
                                    style={{ width: `${loadingProgress}%` }}
                                />
                            </div>
                            <span className="text-sm text-text-tertiary">
                                {Math.round(loadingProgress)}%
                            </span>
                        </div>
                    )}

                </div>
            </div>

            <VideoListWithSearch videos={videos} />
        </div>
    )
}
