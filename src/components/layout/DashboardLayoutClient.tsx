'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import TeamMemberProvider from '@/components/auth/TeamMemberProvider'

interface DashboardLayoutClientProps {
    children: React.ReactNode
    user: User
    role: string
}

export default function DashboardLayoutClient({
    children,
    user,
    role
}: DashboardLayoutClientProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <TeamMemberProvider>
            <div className="flex h-screen supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh] overflow-hidden bg-background">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <Sidebar
                    userRole={role}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden w-full relative">
                    <Header
                        user={user}
                        userRole={role}
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />

                    <main className="flex-1 overflow-y-auto w-full scroll-smooth">
                        <div className="max-w-7xl mx-auto p-4 md:p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </TeamMemberProvider>
    )
}
