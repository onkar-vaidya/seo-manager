'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TeamMember } from '@/lib/team-member-types'
import { assignVideosToMember } from '@/app/actions/assignments'

interface MemberStats {
    name: string
    assigned: number  // assigned but not done
    done: number  // is_seo_done = true (worked by this person)
}

export default function TasksPage() {
    const [stats, setStats] = useState<MemberStats[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()

        // Listen for video updates to refresh stats
        const handleVideoUpdate = () => {
            loadStats()
        }

        window.addEventListener('video-updated', handleVideoUpdate)
        return () => window.removeEventListener('video-updated', handleVideoUpdate)
    }, [])

    const loadStats = async () => {
        const supabase = createClient()

        // Get team members
        const { data: members } = await supabase
            .from('team_members')
            .select('name')
            .eq('is_active', true)
            .order('name')

        // Get all videos
        const { data: videos } = await supabase
            .from('video_seo')
            .select('assigned_to, worked_by, is_seo_done')

        if (!members || !videos) {
            setLoading(false)
            return
        }

        // Calculate stats for each member
        const memberStats: MemberStats[] = members.map(member => {
            const assigned = videos.filter(v =>
                v.assigned_to === member.name && !v.is_seo_done
            ).length

            const done = videos.filter(v =>
                v.worked_by === member.name && v.is_seo_done
            ).length

            return {
                name: member.name,
                assigned,
                done
            }
        })

        setStats(memberStats)
        setLoading(false)
    }

    const totalAssigned = stats.reduce((sum, s) => sum + s.assigned, 0)
    const totalDone = stats.reduce((sum, s) => sum + s.done, 0)

    return (
        <div className="space-y-6">
            {/* Header removed */}

            {/* Assignment Form */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-medium text-text-primary mb-4">Assign Videos</h2>
                <AssignmentForm onAssigned={loadStats} teamMembers={stats.map(s => s.name)} />
            </div>

            {/* Progress Table */}
            {loading ? (
                <div className="glass rounded-xl p-12 text-center">
                    <p className="text-text-tertiary">Loading...</p>
                </div>
            ) : (
                <div className="glass rounded-xl p-6">
                    <h2 className="text-xl font-medium text-text-primary mb-6">Progress</h2>

                    <div className="space-y-4">
                        {/* Header */}
                        <div className="grid grid-cols-3 gap-4 pb-3 border-b border-border">
                            <div className="text-sm font-medium text-text-secondary">Team Member</div>
                            <div className="text-sm font-medium text-text-secondary text-center">Assigned</div>
                            <div className="text-sm font-medium text-text-secondary text-center">Done</div>
                        </div>

                        {/* Team members */}
                        {stats.map(member => (
                            <div key={member.name} className="grid grid-cols-3 gap-4 p-3 bg-background-surface rounded-lg">
                                <div className="text-sm font-medium text-text-primary">
                                    {member.name}
                                </div>
                                <div className="text-center">
                                    <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${member.assigned > 0
                                        ? 'bg-warning/20 text-warning'
                                        : 'text-text-tertiary'
                                        }`}>
                                        {member.assigned}
                                    </span>
                                </div>
                                <div className="text-center">
                                    <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${member.done > 0
                                        ? 'bg-success/20 text-success'
                                        : 'text-text-tertiary'
                                        }`}>
                                        {member.done}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Total */}
                        <div className="grid grid-cols-3 gap-4 p-4 bg-accent/10 rounded-lg border border-accent/30 mt-6">
                            <div className="text-sm font-bold text-accent">
                                Total
                            </div>
                            <div className="text-center">
                                <span className="inline-block px-3 py-1 rounded text-sm font-bold bg-warning/20 text-warning">
                                    {totalAssigned}
                                </span>
                            </div>
                            <div className="text-center">
                                <span className="inline-block px-3 py-1 rounded text-sm font-bold bg-success/20 text-success">
                                    {totalDone}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function AssignmentForm({ onAssigned, teamMembers }: { onAssigned: () => void, teamMembers: string[] }) {
    const [selectedMember, setSelectedMember] = useState('')
    const [videoCount, setVideoCount] = useState(10)
    const [assigning, setAssigning] = useState(false)

    const handleAssign = async () => {
        if (!selectedMember || videoCount < 1) return

        setAssigning(true)

        const supabase = createClient()

        // Get random unassigned videos
        const { data: unassignedVideos } = await supabase
            .from('video_seo')
            .select('id')
            .is('assigned_to', null)
            .eq('is_seo_done', false)
            .limit(videoCount)

        if (!unassignedVideos || unassignedVideos.length === 0) {
            alert('No unassigned videos available')
            setAssigning(false)
            return
        }

        // Assign them
        const result = await assignVideosToMember(
            unassignedVideos.map(v => v.id),
            selectedMember
        )

        if (result.success) {
            alert(`Assigned ${unassignedVideos.length} videos to ${selectedMember}`)
            setSelectedMember('')
            setVideoCount(10)
            onAssigned()
        } else {
            alert('Failed to assign videos: ' + result.error)
        }

        setAssigning(false)
    }

    return (
        <div className="flex items-end gap-4">
            <div className="flex-1">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                    Team Member
                </label>
                <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg text-text-primary"
                >
                    <option value="">Select member...</option>
                    {teamMembers.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>

            <div className="w-32">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                    Videos
                </label>
                <input
                    type="number"
                    min="1"
                    max="100"
                    value={videoCount}
                    onChange={(e) => setVideoCount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg text-text-primary"
                />
            </div>

            <button
                onClick={handleAssign}
                disabled={!selectedMember || assigning}
                className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
            >
                {assigning ? 'Assigning...' : 'Assign'}
            </button>
        </div>
    )
}
