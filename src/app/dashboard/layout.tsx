import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import TeamMemberProvider from '@/components/auth/TeamMemberProvider'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user role from database
    const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    // Default to 'admin' in development for easy testing, otherwise 'viewer'
    const defaultRole = process.env.NODE_ENV === 'development' ? 'admin' : 'viewer'
    const finalRole = userRole?.role || defaultRole

    return (
        <TeamMemberProvider>
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <Sidebar userRole={finalRole} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header user={user} userRole={finalRole} />

                    <main className="flex-1 overflow-y-auto bg-background">
                        <div className="max-w-7xl mx-auto p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </TeamMemberProvider>
    )
}
