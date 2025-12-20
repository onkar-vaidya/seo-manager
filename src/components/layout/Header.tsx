'use client'

import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { TeamMember } from '@/lib/team-member-types'

interface HeaderProps {
    user: User
    userRole: string
}

export default function Header({ user, userRole }: HeaderProps) {
    const router = useRouter()
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

    useEffect(() => {
        // Get selected team member from localStorage
        const stored = localStorage.getItem('selected_team_member')
        if (stored) {
            try {
                setSelectedMember(JSON.parse(stored))
            } catch (e) {
                console.error('Error parsing team member:', e)
            }
        }
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        localStorage.removeItem('selected_team_member')
        router.push('/login')
    }

    const handleSwitchUser = () => {
        localStorage.removeItem('selected_team_member')
        window.location.reload() // Force full page reload to show selector
    }

    return (
        <header className="h-16 border-b border-border bg-background-elevated px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-medium text-text-primary">
                    YouTube SEO Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Team Member Info */}
                {selectedMember && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-background-surface rounded-lg">
                        <span className="text-sm font-medium text-text-primary">
                            {selectedMember.name}
                        </span>
                        <button
                            onClick={handleSwitchUser}
                            className="p-1 hover:bg-background-elevated rounded transition-smooth"
                            title="Switch User"
                        >
                            <svg className="w-4 h-4 text-text-tertiary hover:text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Sign Out Button */}
                <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary 
                             hover:bg-background-surface rounded-lg transition-smooth"
                >
                    Sign Out
                </button>
            </div>
        </header>
    )
}
