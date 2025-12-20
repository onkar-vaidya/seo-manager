'use client'

import { useState, useEffect } from 'react'
import { TeamMember } from '@/lib/team-member-types'
import { createClient } from '@/lib/supabase/client'

interface TeamMemberSelectorProps {
    onSelect: (member: TeamMember) => void
}

export default function TeamMemberSelector({ onSelect }: TeamMemberSelectorProps) {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

    useEffect(() => {
        fetchTeamMembers()
    }, [])

    const fetchTeamMembers = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('is_active', true)
            .order('name')

        if (error) {
            console.error('Error fetching team members:', error)
        } else {
            setTeamMembers(data || [])
        }
        setLoading(false)
    }

    const handleSelect = () => {
        if (selectedMember) {
            // Save to localStorage
            localStorage.setItem('selected_team_member', JSON.stringify(selectedMember))
            onSelect(selectedMember)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass rounded-2xl p-8 max-w-md w-full mx-4 border border-border">
                <h2 className="text-2xl font-medium text-text-primary mb-2">
                    Welcome! Who's working today?
                </h2>
                <p className="text-sm text-text-tertiary mb-6">
                    Select your name to continue
                </p>

                {loading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                            {teamMembers.map((member) => (
                                <button
                                    key={member.id}
                                    onClick={() => setSelectedMember(member)}
                                    className={`w-full px-4 py-3 rounded-lg text-left transition-smooth ${selectedMember?.id === member.id
                                            ? 'bg-accent text-white'
                                            : 'bg-background-elevated text-text-primary hover:bg-background-surface'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{member.name}</span>
                                        <span className={`text-xs px-2 py-1 rounded ${member.role === 'admin'
                                                ? 'bg-accent/20 text-accent'
                                                : 'bg-background-surface text-text-tertiary'
                                            }`}>
                                            {member.role}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleSelect}
                            disabled={!selectedMember}
                            className="w-full px-6 py-3 bg-accent text-white rounded-lg font-medium
                                     hover:bg-accent/90 transition-smooth disabled:opacity-50 
                                     disabled:cursor-not-allowed"
                        >
                            Continue as {selectedMember?.name || '...'}
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
