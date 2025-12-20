import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { VideoSeo } from '@/lib/types'
import SimpleSeoDisplay from '@/components/video-detail/SimpleSeoDisplay'
import DeleteVideoButton from '@/components/video-detail/DeleteVideoButton'
import SeoStatusToggle from '@/components/video-detail/SeoStatusToggle'
import VideoIdBadge from '@/components/video-detail/VideoIdBadge'

import VideoNavigation from '@/components/video-detail/VideoNavigation'

export default async function VideoDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Get current user and role
    const { data: { user } } = await supabase.auth.getUser()
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single()

    let userRole = roleData?.role || 'viewer'

    // DEV ONLY: Fallback to admin if no role found
    if (process.env.NODE_ENV === 'development' && userRole === 'viewer') {
        userRole = 'admin'
    }

    // Fetch video from new simplified table
    const { data: video, error: videoError } = await supabase
        .from('video_seo')
        .select(`
            *,
            channels (
                id,
                channel_name,
                channel_id
            )
        `)
        .eq('id', id)
        .single()

    if (videoError || !video) {
        notFound()
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <Link
                    href="/dashboard/channels"
                    className="hover:text-text-primary transition-smooth"
                >
                    Channels
                </Link>
                <span>/</span>
                <Link
                    href={`/dashboard/channels/${video.channels?.id}`}
                    className="hover:text-text-primary transition-smooth"
                >
                    {video.channels?.channel_name || 'Channel'}
                </Link>
                <span>/</span>
                <span className="text-text-secondary">Video</span>
            </div>

            {/* Header */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <h1 className="text-2xl md:text-4xl font-medium text-text-primary leading-tight order-2 md:order-1">
                        {video.old_title}
                    </h1>
                    {/* Navigation Buttons */}
                    <div className="order-1 md:order-2 w-full md:w-auto flex justify-end">
                        <VideoNavigation currentVideoId={video.id} />
                    </div>
                </div>

                {/* Video ID Badge with Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <VideoIdBadge videoId={video.video_id} />
                        <SeoStatusToggle
                            videoId={video.id}
                            initialStatus={video.is_seo_done || false}
                        />
                    </div>
                    {(userRole === 'admin' || userRole === 'editor') && (
                        <DeleteVideoButton videoId={video.id} channelId={video.channel_id} />
                    )}
                </div>
            </div>

            {/* SEO Information - Simplified */}
            <section className="space-y-4">
                <h2 className="text-2xl font-medium text-text-primary">
                    SEO Content
                </h2>
                <SimpleSeoDisplay video={video} />
            </section>
        </div>
    )
}
