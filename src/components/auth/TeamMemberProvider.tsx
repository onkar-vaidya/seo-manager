'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TeamMemberSelector from '@/components/auth/TeamMemberSelector'
import { TeamMember } from '@/lib/team-member-types'

export default function TeamMemberProvider({ children }: { children: React.ReactNode }) {
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if team member is already selected
        const stored = localStorage.getItem('selected_team_member')
        if (stored) {
            try {
                setSelectedMember(JSON.parse(stored))
            } catch (e) {
                console.error('Error parsing stored team member:', e)
            }
        }
        setLoading(false)
    }, [])

    const handleSelect = (member: TeamMember) => {
        setSelectedMember(member)
        router.refresh()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!selectedMember) {
        return <TeamMemberSelector onSelect={handleSelect} />
    }

    return <>{children}</>
}
