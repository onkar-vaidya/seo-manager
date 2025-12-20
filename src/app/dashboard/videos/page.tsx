'use client'

import { useState, useEffect } from 'react'
import VideoListWithSearch from '@/components/videos/VideoListWithSearch'
import { VideoSeo } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

export default function VideosPage() {
    // Initialize with cached data immediately
    const getCachedVideos = () => {
        if (typeof window === 'undefined') return []
        const cached = localStorage.getItem('all_videos_cache')
        const cacheTimestamp = localStorage.getItem('all_videos_cache_time')

        if (cached && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp)
            if (cacheAge < 5 * 60 * 1000) {
                return JSON.parse(cached)
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
                    newVideos[index] = updatedVideo
                    return newVideos
                }
                return prevVideos
            })
        }

        window.addEventListener('video-updated', handleVideoUpdate)
        return () => window.removeEventListener('video-updated', handleVideoUpdate)
    }, [])

    const loadAllVideos = async () => {
        // Check if we have cached videos
        const cached = localStorage.getItem('all_videos_cache')
        const cacheTimestamp = localStorage.getItem('all_videos_cache_time')

        // Use cache if it's less than 5 minutes old
        if (cached && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp)
            if (cacheAge < 5 * 60 * 1000) { // 5 minutes
                console.log('Using cached videos')
                setVideos(JSON.parse(cached))
                setLoading(false)
                return
            }
        }

        // Fetch all videos in batches
        const supabase = createClient()
        const batchSize = 1000
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
        localStorage.setItem('all_videos_cache', JSON.stringify(allVideos))
        localStorage.setItem('all_videos_cache_time', Date.now().toString())

        setVideos(allVideos as any)
        setLoadingProgress(100)
        setLoading(false)
        console.log(`Loaded ${allVideos.length} videos`)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                {/* Title removed */}
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
