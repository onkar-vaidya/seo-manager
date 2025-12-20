'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TeamMember } from '@/lib/team-member-types'

interface SidebarProps {
    userRole: string
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ userRole, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

    useEffect(() => {
        const updateMember = () => {
            const stored = localStorage.getItem('selected_team_member')
            if (stored) {
                try {
                    setSelectedMember(JSON.parse(stored))
                } catch (e) {
                    console.error('Error parsing team member:', e)
                }
            } else {
                setSelectedMember(null)
            }
        }

        // Initial load
        updateMember()

        // Listen for storage changes
        window.addEventListener('storage', updateMember)
        // Custom event for same-window updates
        window.addEventListener('team-member-updated', updateMember)

        return () => {
            window.removeEventListener('storage', updateMember)
            window.removeEventListener('team-member-updated', updateMember)
        }
    }, [])

    const navItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: DashboardIcon
        },
        {
            name: 'Channels',
            href: '/dashboard/channels',
            icon: ChannelsIcon,
            minRole: 'viewer'
        },
        {
            name: 'Videos',
            href: '/dashboard/videos',
            icon: VideosIcon,
            minRole: 'viewer'
        },
        {
            name: 'Tasks',
            href: '/dashboard/tasks',
            icon: TasksIcon,
            minRole: 'editor'
        },
        {
            name: 'Research',
            href: '/dashboard/research',
            icon: ResearchIcon,
            minRole: 'viewer'
        },
    ]


    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        localStorage.removeItem('selected_team_member')
        router.push('/login')
    }

    const handleSwitchUser = () => {
        localStorage.removeItem('selected_team_member')
        window.location.reload()
    }

    const isActive = (href: string) => pathname === href

    return (
        <>
            <aside className={`
                w-64 bg-background-elevated border-r border-border flex flex-col
                fixed inset-y-0 left-0 z-50
                transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo & Close Button */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                    <h2 className="text-lg font-medium text-text-primary px-2">
                        SEO Manager <span className="text-accent text-sm">X SooperBlooper</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="md:hidden p-1 text-text-secondary hover:text-text-primary"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        // Check visibility based on role
                        if (item.minRole === 'admin' && userRole !== 'admin') return null
                        if (item.minRole === 'editor' && userRole === 'viewer') return null

                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => onClose()} // Close sidebar on selection (mobile)
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg
                                    transition-smooth
                                    ${isActive(item.href)
                                        ? 'bg-accent/10 text-accent'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-background-surface'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* User Profile Card */}
                <div className="p-4 border-t border-border">
                    <div className="p-3 bg-background-surface/50 rounded-xl border border-border/50 hover:bg-background-surface hover:border-border transition-all group">
                        <div className="flex items-center gap-3">
                            {/* Avatar - Updated Color */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20 ring-2 ring-background ring-offset-2 ring-offset-background-elevated">
                                {selectedMember
                                    ? selectedMember.name.charAt(0).toUpperCase()
                                    : userRole.charAt(0).toUpperCase()
                                }
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate transition-colors">
                                    {selectedMember ? selectedMember.name : 'My Account'}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                                    <p className="text-xs text-text-tertiary font-medium capitalize truncate">
                                        {selectedMember ? selectedMember.role : userRole}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions Row - Merged Below */}
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
                            <button
                                onClick={handleSwitchUser}
                                className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-background-elevated rounded-lg transition-colors"
                                title="Switch User"
                            >
                                <SwitchUserIcon className="w-3.5 h-3.5" />
                                <span>Switch</span>
                            </button>
                            <div className="w-px h-4 bg-border/50"></div>
                            <button
                                onClick={handleSignOut}
                                className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-medium text-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                title="Sign Out"
                            >
                                <SignOutIcon className="w-3.5 h-3.5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

// Simple SVG Icons
function DashboardIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    )
}

function ChannelsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
    )
}

function VideosIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    )
}

function TasksIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    )
}

function ResearchIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    )
}

function SignOutIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    )
}

function SwitchUserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
    )
}
