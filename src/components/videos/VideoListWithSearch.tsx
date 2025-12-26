'use client'

import { useState, useEffect, useMemo, useDeferredValue } from 'react'
import VideoRow from '@/components/videos/VideoRow'
import { VideoSeo } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface VideoListWithSearchProps {
    videos: VideoSeo[]
}

type SeoFilter = 'all' | 'done' | 'not-done'

export default function VideoListWithSearch({ videos }: VideoListWithSearchProps) {
    const [visibleCount, setVisibleCount] = useState(20)
    const [searchQuery, setSearchQuery] = useState('')
    const deferredSearchQuery = useDeferredValue(searchQuery) // Defer search updates

    const [seoFilter, setSeoFilter] = useState<SeoFilter>('all')
    const [memberFilter, setMemberFilter] = useState<string>('all')
    const [teamMembers, setTeamMembers] = useState<string[]>([])

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(20)
    }, [deferredSearchQuery, seoFilter, memberFilter])

    useEffect(() => {
        // Fetch team members for filter
        const fetchMembers = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('team_members')
                .select('name')
                .eq('is_active', true)
                .order('name')

            if (data) {
                setTeamMembers(data.map((m: any) => m.name))
            }
        }
        fetchMembers()
    }, [])



    // Calculate counts for filters based on current videos
    const counts = useMemo(() => {
        return {
            done: videos.filter(v => v.is_seo_done).length,
            notDone: videos.filter(v => !v.is_seo_done).length
        }
    }, [videos])

    const filteredVideos = useMemo(() => {
        // DEBUG: Check if we have any assigned videos in the raw list
        if (memberFilter !== 'all' && memberFilter !== 'unassigned') {
            const assignedCount = videos.filter(v => v.assigned_to === memberFilter).length
            console.log(`[Debug] Filtering for ${memberFilter}. Found ${assignedCount} matches in ${videos.length} videos.`)

            // Check first few videos to see data structure
            const sample = videos.find(v => v.assigned_to)
            if (sample) {
                console.log('[Debug] Sample video with assignment:', { id: sample.video_id, assigned_to: sample.assigned_to })
            } else {
                console.log('[Debug] No videos found with any assignment property in current batch')
            }
        }

        return videos.filter(video => {
            // Filter by search query
            const matchesSearch = video.video_id.toLowerCase().includes(deferredSearchQuery.toLowerCase())

            // Filter by SEO status
            const matchesSeoFilter =
                seoFilter === 'all' ? true :
                    seoFilter === 'done' ? !!video.is_seo_done :
                        !video.is_seo_done

            // Filter by assigned member
            const matchesMemberFilter =
                memberFilter === 'all' ? true :
                    memberFilter === 'unassigned' ? !video.assigned_to :
                        video.assigned_to === memberFilter

            return matchesSearch && matchesSeoFilter && matchesMemberFilter
        })
    }, [videos, deferredSearchQuery, seoFilter, memberFilter])

    // Update navigation queue in sessionStorage whenever the filtered list changes
    useEffect(() => {
        const queue = filteredVideos.map(v => v.id)
        sessionStorage.setItem('video_queue', JSON.stringify(queue))
    }, [filteredVideos])

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => prev + 20)
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        )

        const sentinel = document.getElementById('scroll-sentinel')
        if (sentinel) {
            observer.observe(sentinel)
        }

        return () => observer.disconnect()
    }, [filteredVideos.length, visibleCount])

    const visibleVideos = filteredVideos.slice(0, visibleCount)

    return (
        <div className="space-y-4">
            {/* Results Count - HIDDEN as per request */}
            <div className="flex items-center justify-between text-sm">

            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search by Video ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 bg-background-elevated border border-border rounded-lg 
                                 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 
                                 focus:ring-accent/50 transition-smooth"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                    {/* SEO Status Filter - Horizontal Scroll for mobile */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
                        <span className="text-sm text-text-tertiary whitespace-nowrap">SEO:</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSeoFilter('done')}
                                className={`px-3 py-2 text-sm rounded-lg transition-smooth flex items-center gap-1 whitespace-nowrap ${seoFilter === 'done'
                                    ? 'bg-success text-white'
                                    : 'bg-background-elevated text-text-secondary hover:bg-background-surface'
                                    }`}
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Done ({counts.done})
                            </button>
                            <button
                                onClick={() => setSeoFilter('not-done')}
                                className={`px-3 py-2 text-sm rounded-lg transition-smooth flex items-center gap-1 whitespace-nowrap ${seoFilter === 'not-done'
                                    ? 'bg-warning text-white'
                                    : 'bg-background-elevated text-text-secondary hover:bg-background-surface'
                                    }`}
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Not Done ({counts.notDone})
                            </button>
                            {seoFilter !== 'all' && (
                                <button
                                    onClick={() => setSeoFilter('all')}
                                    className="px-2 py-2 text-xs text-text-tertiary hover:text-text-primary transition-smooth whitespace-nowrap"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Member Filter */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm text-text-tertiary whitespace-nowrap">Assigned:</span>
                        <select
                            value={memberFilter}
                            onChange={(e) => setMemberFilter(e.target.value)}
                            className="flex-1 sm:flex-none px-3 py-2 text-sm bg-background-elevated border border-border rounded-lg text-text-primary min-w-[140px]"
                        >
                            <option value="all">All</option>
                            <option value="unassigned">Unassigned</option>
                            {teamMembers.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>



            {/* Video List */}
            {visibleVideos.length > 0 ? (
                <div className="space-y-2">
                    {visibleVideos.map((video, index) => (
                        <div
                            key={video.id}
                            style={{ contentVisibility: 'auto', containIntrinsicSize: '100px' }}
                        >
                            <VideoRow video={video} />
                        </div>
                    ))}
                    {/* Sentinel for infinite scroll */}
                    {visibleCount < filteredVideos.length && (
                        <div id="scroll-sentinel" className="h-20 flex items-center justify-center p-4">
                            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass rounded-xl p-12 text-center animate-fade-in">
                    <p className="text-text-secondary">
                        {searchQuery || seoFilter !== 'all' || memberFilter !== 'all' ? (
                            <>No videos found matching your filters</>
                        ) : (
                            <>No videos found. Add videos to see them here.</>
                        )}
                    </p>
                </div>
            )}
        </div>
    )
}
