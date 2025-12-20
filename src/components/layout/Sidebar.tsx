'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TeamMember } from '@/lib/team-member-types'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
    userRole: string
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ userRole, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

    // User Switcher State
    const [activePopover, setActivePopover] = useState<'switch' | 'signout' | null>(null)
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const switcherRef = useRef<HTMLDivElement>(null)

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

        // Fetch team members for the switcher
        const fetchTeamMembers = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('team_members')
                .select('*')
                .eq('is_active', true)
                .order('name')

            if (data) setTeamMembers(data)
        }

        // Initial load
        updateMember()
        fetchTeamMembers()

        // Listen for storage changes
        window.addEventListener('storage', updateMember)
        // Custom event for same-window updates
        window.addEventListener('team-member-updated', updateMember)

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
                setActivePopover(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            window.removeEventListener('storage', updateMember)
            window.removeEventListener('team-member-updated', updateMember)
            document.removeEventListener('mousedown', handleClickOutside)
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

    const handleSwitch = (member: TeamMember) => {
        localStorage.setItem('selected_team_member', JSON.stringify(member))
        // Dispatch custom event to update UI immediately in other components
        window.dispatchEvent(new Event('team-member-updated'))
        // Force router refresh to ensure server components update if they depend on cookies/headers (though mostly client side here)
        router.refresh()
        setActivePopover(null)
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
                    <h2 className="flex items-center gap-2 text-lg font-medium text-text-primary px-2">
                        <span>SEO</span>
                        <span className="text-accent text-sm font-normal opacity-80 decoration-dotted">X SooperBlooper</span>
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
                <div className="p-4 border-t border-border mt-auto relative" ref={switcherRef}>

                    {/* Unified Popover */}
                    <AnimatePresence mode="wait">
                        {activePopover && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute bottom-4 left-4 right-4 bg-background-elevated/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/5"
                                style={{
                                    boxShadow: '0 -4px 20px -5px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                {/* Switcher Content */}
                                {activePopover === 'switch' && (
                                    <div className="p-2 space-y-1 max-h-60 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                        <p className="px-2 py-1.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                                            Switch Account
                                        </p>
                                        {teamMembers.map((member) => (
                                            <button
                                                key={member.id}
                                                onClick={() => handleSwitch(member)}
                                                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors group
                                                    ${selectedMember?.id === member.id
                                                        ? 'bg-accent/10 text-accent'
                                                        : 'hover:bg-white/5 text-text-secondary hover:text-text-primary'
                                                    }
                                                `}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105
                                                    ${selectedMember?.id === member.id
                                                        ? 'bg-accent text-white shadow-sm'
                                                        : 'bg-background-surface text-text-secondary'
                                                    }
                                               `}>
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="text-sm font-medium leading-none truncate">{member.name}</p>
                                                    <p className="text-[10px] opacity-70 mt-0.5 capitalize truncate">{member.role}</p>
                                                </div>
                                                {selectedMember?.id === member.id && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Sign Out Confirmation */}
                                {activePopover === 'signout' && (
                                    <div className="p-4 text-center">
                                        <div className="w-10 h-10 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <SignOutIcon className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-medium text-text-primary mb-1">Sign Out?</p>
                                        <p className="text-xs text-text-secondary mb-4">Are you sure you want to leave?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setActivePopover(null)}
                                                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary bg-background-surface hover:bg-background-elevated transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSignOut}
                                                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="p-3 rounded-xl border border-white/5 bg-black/20 hover:bg-black/30 transition-all group relative z-10">
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
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/40">
                            <button
                                onClick={() => setActivePopover(activePopover === 'switch' ? null : 'switch')}
                                className={`flex-1 flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 overflow-hidden
                                    ${activePopover === 'switch'
                                        ? 'text-red-400 bg-red-400/10'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-background-elevated/50'
                                    }
                                `}
                                title={activePopover === 'switch' ? "Close" : "Switch User"}
                            >
                                <div className="relative w-4 h-4 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        {activePopover === 'switch' ? (
                                            <motion.svg
                                                key="close-icon"
                                                initial={{ rotate: -90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: 90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute w-3.5 h-3.5"
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </motion.svg>
                                        ) : (
                                            <motion.div
                                                key="switch-icon"
                                                initial={{ rotate: 90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: -90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <SwitchUserIcon className="w-3.5 h-3.5" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {activePopover !== 'switch' ? (
                                        <motion.span
                                            key="label-switch"
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 20, opacity: 0 }} // Swoosh to the right
                                            transition={{ duration: 0.2 }}
                                        >
                                            Switch
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="label-close"
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 10, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            Close
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>

                            <div className="w-px h-3 bg-border/40"></div>

                            <button
                                onClick={() => setActivePopover(activePopover === 'signout' ? null : 'signout')}
                                className={`flex-1 flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors
                                    ${activePopover === 'signout'
                                        ? 'text-red-400 bg-red-400/10'
                                        : 'text-text-secondary hover:text-red-400 hover:bg-red-400/10'
                                    }
                                `}
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
