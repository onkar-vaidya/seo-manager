import Link from 'next/link'
import { getDashboardStats, getRecentVideos } from '@/app/actions/dashboard'
import StatsCard from '@/components/dashboard/StatsCard'
import DashboardSyncer from '@/components/dashboard/DashboardSyncer'
import DashboardGreetings from '@/components/dashboard/DashboardGreetings'
import { VideoSeo } from '@/lib/types'

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const recentVideos = await getRecentVideos(5)

    return (
        <div className="space-y-8">
            <DashboardSyncer />

            {/* Greetings Section */}
            <DashboardGreetings />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Videos"
                    value={stats.totalVideos}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    }
                    color="primary"
                />
                <StatsCard
                    title="SEO Completed"
                    value={stats.seoDone}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    trend={`${Math.round((stats.seoDone / (stats.totalVideos || 1)) * 100)}% completion rate`}
                    color="success"
                />
                <StatsCard
                    title="Pending Tasks"
                    value={stats.seoPending}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="warning"
                />
                <StatsCard
                    title="Active Channels"
                    value={stats.totalChannels}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    }
                    color="info"
                />
            </div>

            {/* Recent Activity Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium text-text-primary">Recent Activity</h2>
                    <Link
                        href="/dashboard/videos"
                        className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
                    >
                        View All
                    </Link>
                </div>

                <div className="glass rounded-xl overflow-hidden">
                    {recentVideos.length > 0 ? (
                        <div className="divide-y divide-border">
                            {recentVideos.map((video) => (
                                <Link
                                    href={`/dashboard/videos/${video.id}`}
                                    key={video.id}
                                    className="block p-4 hover:bg-background-surface transition-smooth group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Thumbnail / Icon Placeholder */}
                                            <div className="w-10 h-10 rounded-lg bg-background-elevated flex items-center justify-center text-text-tertiary group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                                                    {video.old_title || video.video_id}
                                                </h4>
                                                <p className="text-xs text-text-tertiary flex items-center gap-2">
                                                    <span>{video.channels?.channel_name}</span>
                                                    <span>•</span>
                                                    <span>{new Date(video.updated_at || video.created_at || '').toLocaleDateString()}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Status Badge */}
                                            <span className={`px-2 py-1 text-xs rounded-md font-medium ${video.is_seo_done
                                                ? 'bg-success/10 text-success'
                                                : 'bg-warning/10 text-warning'
                                                }`}>
                                                {video.is_seo_done ? 'Done' : 'Pending'}
                                            </span>

                                            <svg className="w-4 h-4 text-text-tertiary group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-text-secondary">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
