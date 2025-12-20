'use server'

import { createClient } from '@/lib/supabase/server'
import { VideoSeo } from '@/lib/types'

export interface DashboardStats {
    totalVideos: number
    seoDone: number
    seoPending: number
    totalChannels: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient()

    // Run queries in parallel for performance
    const [videosResponse, seoDoneResponse, channelsResponse] = await Promise.all([
        supabase.from('video_seo').select('id', { count: 'exact', head: true }),
        supabase.from('video_seo').select('id', { count: 'exact', head: true }).eq('is_seo_done', true),
        supabase.from('channels').select('id', { count: 'exact', head: true })
    ])

    const totalVideos = videosResponse.count || 0
    const seoDone = seoDoneResponse.count || 0
    const totalChannels = channelsResponse.count || 0

    return {
        totalVideos,
        seoDone,
        seoPending: totalVideos - seoDone,
        totalChannels
    }
}

export async function getRecentVideos(limit: number = 5): Promise<VideoSeo[]> {
    const supabase = await createClient()

    const { data: videos, error } = await supabase
        .from('video_seo')
        .select(`
            *,
            channels!inner (
                channel_name,
                channel_id
            )
        `)
        .order('updated_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching recent videos:', error)
        return []
    }

    return videos as VideoSeo[]
}
