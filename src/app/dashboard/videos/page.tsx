'use client'

import { useState, useEffect } from 'react'
import VideoListWithSearch from '@/components/videos/VideoListWithSearch'
import { VideoSeo } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

export default function VideosPage() {
    // Initialize with cached data immediately
    const getCachedVideos = () => {
        if (typeof window === 'undefined') return []
        const cached = localStorage.getItem('all_videos_cache_v5')
        const cacheTimestamp = localStorage.getItem('all_videos_cache_time_v5')

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
                    localStorage.setItem('all_videos_cache_v5', JSON.stringify(newVideos))
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
        const cached = localStorage.getItem('all_videos_cache_v5')
        const cacheTimestamp = localStorage.getItem('all_videos_cache_time_v5')

        // Use cache if it's less than 24 hours old AND not a hard reload
        if (!isReload && cached && cacheTimestamp) {
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
        } else if (isReload) {
            console.log('Hard refresh detected, bypassing cache')
        }

        // Fetch all videos in batches
        const supabase = createClient()

        // Optimize: Fetch count first to calculate batches
        const { count, error: countError } = await supabase
            .from('video_seo')
            .select('*', { count: 'exact', head: true })

        if (countError || !count) {
            console.error('Error fetching video count:', countError)
            setLoading(false)
            return
        }

        const batchSize = 1000
        const totalBatches = Math.ceil(count / batchSize)
        const batches = Array.from({ length: totalBatches }, (_, i) => i)

        // Process batches in chunks to avoid overwhelming the browser/network
        // Parallel fetching with concurrency limit of 3
        const CONCURRENT_LIMIT = 3
        let allVideos: any[] = []

        for (let i = 0; i < batches.length; i += CONCURRENT_LIMIT) {
            const currentBatchIndices = batches.slice(i, i + CONCURRENT_LIMIT)
            const batchPromises = currentBatchIndices.map(async (batchIndex) => {
                const from = batchIndex * batchSize
                const to = from + batchSize - 1

                const { data, error } = await supabase
                    .from('video_seo')
                    .select(`
                        id,
                        channel_id,
                        video_id,
                        old_title,
                        is_seo_done,
                        created_at,
                        assigned_to,
                        channels!inner (
                            id,
                            channel_name,
                            channel_id
                        )
                    `)
                    .order('created_at', { ascending: false })
                    .range(from, to)

                if (error) throw error
                return data || []
            })

            try {
                const results = await Promise.all(batchPromises)
                results.forEach(batchData => {
                    allVideos = [...allVideos, ...batchData]
                })

                // Update progress
                const progress = Math.min(95, (allVideos.length / count) * 100)
                setLoadingProgress(progress)
            } catch (err) {
                console.error('Error fetching batch:', err)
                // Continue with partial data if possible
            }
        }

        // Cache the results
        localStorage.setItem('all_videos_cache_v5', JSON.stringify(allVideos))
        localStorage.setItem('all_videos_cache_time_v5', Date.now().toString())

        setVideos(allVideos as any)
        setLoadingProgress(100)
        setLoading(false)
        console.log(`Loaded ${allVideos.length} videos`)
    }

    const handleForceRefresh = () => {
        // Clear cache
        localStorage.removeItem('all_videos_cache_v5')
        localStorage.removeItem('all_videos_cache_time_v5')
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
