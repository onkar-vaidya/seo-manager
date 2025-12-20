import { createClient } from '@/lib/supabase/server'
import { Channel } from '@/lib/types'
import ChannelCard from '@/components/channels/ChannelCard'

export default async function ChannelsPage() {
    const supabase = await createClient()

    const { data: channels, error } = await supabase
        .from('channels')
        .select('*')
        .order('channel_name', { ascending: true })

    if (error) {
        console.error('Error fetching channels:', error)
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-medium text-text-primary mb-2">
                    Channels
                </h1>
                <p className="text-text-secondary">
                    Manage your YouTube channels
                </p>
            </div>

            {/* Channels Grid */}
            {channels && channels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {channels.map((channel: Channel) => (
                        <ChannelCard key={channel.id} channel={channel} />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="glass rounded-xl p-16 text-center space-y-4">
                    <p className="text-text-secondary">
                        No channels found
                    </p>
                </div>
            )}
        </div>
    )
}


