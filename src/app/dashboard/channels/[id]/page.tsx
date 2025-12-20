import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ChannelVideosClient from '@/components/channels/ChannelVideosClient'
import ChannelActions from '@/components/channels/ChannelActions'
import EditableChannelName from '@/components/channels/EditableChannelName'
import { VideoSeo } from '@/lib/types'

export default async function ChannelDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch channel details
    const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('*')
        .eq('id', id)
        .single()

    if (channelError || !channel) {
        notFound()
    }

    // Fetch videos for this channel (optimized - only select needed fields)
    const { data: videos, error: videosError } = await supabase
        .from('video_seo')
        .select('id, channel_id, video_id, old_title, is_seo_done, created_at')
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: false })
        .limit(1000) // Limit for performance

    if (videosError) {
        console.error('Error fetching videos:', videosError)
    }

    // Transform to include active_seo for VideoRow component
    const videosWithSeo: VideoSeo[] = videos?.map((video: any) => ({
        ...video,
    })) || []

    // Fetch user role
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

    return (
        <div className="space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <Link
                    href="/dashboard/channels"
                    className="hover:text-text-primary transition-smooth"
                >
                    Channels
                </Link>
                <span>/</span>
                <span className="text-text-secondary">{channel.channel_name}</span>
            </div>

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <EditableChannelName
                        channelId={channel.id}
                        initialName={channel.channel_name}
                        userRole={userRole}
                    />
                    <p className="text-text-tertiary font-mono text-sm">
                        {channel.channel_id}
                    </p>
                </div>
                <ChannelActions
                    channelId={channel.id}
                    userRole={userRole as 'admin' | 'editor' | 'viewer'}
                />
            </div>

            {/* Videos Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-medium text-text-primary">Videos</h2>
                </div>
                <ChannelVideosClient channelId={channel.id} initialVideos={videosWithSeo} />
            </section>
        </div>
    )
}
