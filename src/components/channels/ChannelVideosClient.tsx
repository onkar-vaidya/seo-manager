'use client'

import { useState, useEffect } from 'react'
import VideoListWithSearch from '@/components/videos/VideoListWithSearch'
import { VideoSeo } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface ChannelVideosClientProps {
    channelId: string
    initialVideos: VideoSeo[]
}

export default function ChannelVideosClient({ channelId, initialVideos }: ChannelVideosClientProps) {
    // Initialize with cached data or initial data immediately
    const getInitialVideos = () => {
        if (typeof window === 'undefined') return initialVideos

        const cacheKey = `channel_videos_${channelId}`
        const cached = localStorage.getItem(cacheKey)
        const cacheTime = localStorage.getItem(`${cacheKey}_time`)

        if (cached && cacheTime) {
            const age = Date.now() - parseInt(cacheTime)
            if (age < 5 * 60 * 1000) {
                return JSON.parse(cached)
            }
        }
        return initialVideos
    }

    const [videos, setVideos] = useState<VideoSeo[]>(getInitialVideos())
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadAllChannelVideos()

        // Listen for video updates
        const handleVideoUpdate = (event: any) => {
            const updatedVideo = event.detail
            if (updatedVideo.channel_id === channelId) {
                setVideos(prevVideos => {
                    const index = prevVideos.findIndex(v => v.id === updatedVideo.id)
                    if (index !== -1) {
                        const newVideos = [...prevVideos]
                        newVideos[index] = updatedVideo

                        // Update cache
                        const cacheKey = `channel_videos_${channelId}`
                        localStorage.setItem(cacheKey, JSON.stringify(newVideos))

                        return newVideos
                    }
                    return prevVideos
                })
            }
        }

        window.addEventListener('video-updated', handleVideoUpdate)
        return () => window.removeEventListener('video-updated', handleVideoUpdate)
    }, [channelId])

    const loadAllChannelVideos = async () => {
        // Check cache first
        const cacheKey = `channel_videos_${channelId}`
        const cached = localStorage.getItem(cacheKey)
        const cacheTime = localStorage.getItem(`${cacheKey}_time`)

        if (cached && cacheTime) {
            const age = Date.now() - parseInt(cacheTime)
            if (age < 5 * 60 * 1000) {
                return // Use cached data
            }
        }

        // Fetch all videos in batches
        setLoading(true)
        const supabase = createClient()
        const batchSize = 1000
        let allVideos: any[] = []
        let offset = 0
        let hasMore = true

        while (hasMore) {
            const { data: batch, error } = await supabase
                .from('video_seo')
                .select('id, channel_id, video_id, old_title, is_seo_done, assigned_to, worked_by, created_at')
                .eq('channel_id', channelId)
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

                // Update UI with partial results - REMOVED to prevent crash
                // setVideos(allVideos as any)
            } else {
                hasMore = false
            }
        }

        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(allVideos))
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString())

        setVideos(allVideos as any)
        setLoading(false)
    }

    return <VideoListWithSearch videos={videos} />
}
