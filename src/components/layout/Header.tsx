'use client'

import { User } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'

interface HeaderProps {
    user: User
    userRole: string
    onMenuClick: () => void
}

export default function Header({ user, userRole, onMenuClick }: HeaderProps) {
    const pathName = usePathname()

    const getPageTitle = () => {
        if (pathName === '/dashboard') return 'Dashboard'
        if (pathName.startsWith('/dashboard/channels')) return 'Channels'
        if (pathName.startsWith('/dashboard/videos')) return 'Videos'
        if (pathName.startsWith('/dashboard/tasks')) return 'Tasks'
        return 'Dashboard'
    }

    return (
        <header className="h-16 border-b border-border bg-background-elevated px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 w-full">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-background-surface rounded-lg"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <h1 className="text-2xl font-semibold text-text-primary">
                    {getPageTitle()}
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Header Actions can go here if needed later */}
            </div>
        </header>
    )
}
